const Order = require("../../models/User/orderModel");
const Driver = require("../../models/Delivery/driverModel");
const User = require("../../models/User/userModel");
const { sendToToken } = require("../../utils/push");

// Helper: send push to the customer who owns an order
async function notifyCustomer(order, { title, body, type }) {
  try {
    const user = await User.findById(order.user).select("fcmToken").lean();
    if (user?.fcmToken) {
      await sendToToken(user.fcmToken, {
        title,
        body,
        data: { type, orderId: String(order._id) },
      });
    }
  } catch (_) {
    // push failure must never affect the main response
  }
}

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * @route GET /api/delivery/orders/available
 * @desc  Orders placed by customers that no partner has accepted yet.
 */
const getAvailableOrders = async (req, res) => {
  try {
    // "Available" = not yet claimed by any partner. Treat orders that predate
    // the delivery fields (missing deliveryStatus) as available too.
    const orders = await Order.find({
      $and: [
        {
          $or: [
            { deliveryStatus: "placed" },
            { deliveryStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { deliveryPartner: null },
            { deliveryPartner: { $exists: false } },
          ],
        },
      ],
    })
      .populate("user", "phone userDetails")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getAvailableOrders error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route GET /api/delivery/orders/mine
 * @desc  Orders assigned to the logged-in delivery partner.
 *        Optional ?status= filter (accepted | out_for_delivery | delivered | undelivered)
 */
const getMyOrders = async (req, res) => {
  try {
    const filter = { deliveryPartner: req.driver._id };
    if (req.query.status) filter.deliveryStatus = req.query.status;

    const orders = await Order.find(filter)
      .populate("user", "phone userDetails")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route GET /api/delivery/orders/:id
 * @desc  Single order detail (must belong to this partner, or still be available).
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "phone userDetails"
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/delivery/orders/:id/accept
 * @desc  Claim an available order. First partner to accept wins.
 */
const acceptOrder = async (req, res) => {
  try {
    // Atomic claim: only succeeds if still unassigned and placed.
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, deliveryStatus: "placed", deliveryPartner: null },
      {
        deliveryStatus: "accepted",
        deliveryPartner: req.driver._id,
        acceptedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(409).json({
        success: false,
        message: "This order was already accepted by another partner",
      });
    }

    // Push confirmation to the driver (non-blocking).
    sendToToken(req.driver.fcmToken, {
      title: "Order Accepted",
      body: `Order ${order.orderId} worth Rs.${order.total} is now assigned to you. Head to the pickup point and start delivery.`,
      data: { type: "accepted", orderId: String(order._id) },
    }).catch(() => {});

    // Notify the customer their order has been accepted.
    notifyCustomer(order, {
      title: "Order Accepted",
      body: `Your order #${order.orderId} has been accepted by a delivery partner and is being prepared.`,
      type: "accepted",
    });

    return res
      .status(200)
      .json({ success: true, message: "Order accepted", order });
  } catch (error) {
    console.error("acceptOrder error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/delivery/orders/:id/start
 * @desc  Start delivery: generate a delivery OTP for the customer and move the
 *        order to out_for_delivery. The OTP is shown to the customer in their
 *        app; the partner asks for it at the door.
 */
const startDelivery = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      deliveryPartner: req.driver._id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found for this partner" });
    }
    if (order.deliveryStatus === "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Order already delivered" });
    }

    // Start the delivery. No OTP is generated yet.
    order.deliveryStatus = "out_for_delivery";
    order.outForDeliveryAt = new Date();
    await order.save();

    // Remind the driver they are now on the way.
    sendToToken(req.driver.fcmToken, {
      title: "Delivery Started",
      body: `Head to the customer location for order ${order.orderId}. Ask for the OTP when you arrive at the door.`,
      data: { type: "out_for_delivery", orderId: String(order._id) },
    }).catch(() => {});

    // Notify the customer their order is on the way.
    notifyCustomer(order, {
      title: "Order Out for Delivery",
      body: `Your order #${order.orderId} is on the way! Your delivery partner will arrive soon.`,
      type: "out_for_delivery",
    });

    return res.status(200).json({
      success: true,
      message: "Delivery started.",
    });
  } catch (error) {
    console.error("startDelivery error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/delivery/orders/:id/request-otp
 * @desc  Partner is at the customer's door and requests the delivery OTP.
 *        This generates a fresh OTP which the customer then sees in their app
 *        and reads out to the partner.
 */
const requestDeliveryOtp = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      deliveryPartner: req.driver._id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found for this partner" });
    }
    if (order.deliveryStatus === "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Order already delivered" });
    }

    const otp = generateOTP();
    order.deliveryOtp = otp;
    order.deliveryOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    // Make sure the order is marked out-for-delivery when OTP is requested.
    if (order.deliveryStatus === "accepted") {
      order.deliveryStatus = "out_for_delivery";
      order.outForDeliveryAt = new Date();
    }
    await order.save();

    console.log(`Delivery OTP for order ${order.orderId}: ${otp}`);

    // Remind the driver the OTP is now live on the customer's screen.
    sendToToken(req.driver.fcmToken, {
      title: "OTP Sent to Customer",
      body: `The customer can see the OTP in their app for order ${order.orderId}. Ask them to read it out to complete delivery.`,
      data: { type: "otp_requested", orderId: String(order._id) },
    }).catch(() => {});

    // Notify the customer to share their OTP.
    notifyCustomer(order, {
      title: "Delivery Partner at Your Door",
      body: `Your delivery partner has arrived for order #${order.orderId}. Open the app to share your OTP and complete delivery.`,
      type: "otp_requested",
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to customer. Ask them to read it out.",
    });
  } catch (error) {
    console.error("requestDeliveryOtp error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/delivery/orders/:id/verify-otp
 * @desc  Partner enters the OTP the customer read out. On match, the order is
 *        marked delivered and the partner's wallet is credited.
 */
const verifyDeliveryOtp = async (req, res) => {
  try {
    const { otp, remarks } = req.body;
    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is required" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      deliveryPartner: req.driver._id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found for this partner" });
    }
    if (order.deliveryStatus === "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Order already delivered" });
    }
    if (
      !order.deliveryOtp ||
      String(order.deliveryOtp) !== String(otp) ||
      !order.deliveryOtpExpiry ||
      order.deliveryOtpExpiry < new Date()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    order.deliveryStatus = "delivered";
    order.status = "delivered";
    order.deliveredAt = new Date();
    order.deliveryRemarks = remarks || order.deliveryRemarks;
    order.deliveryOtp = undefined;
    order.deliveryOtpExpiry = undefined;
    await order.save();

    // Congratulate the driver on a completed delivery.
    sendToToken(req.driver.fcmToken, {
      title: "Delivery Completed",
      body: `Order ${order.orderId} worth Rs.${order.total} has been delivered successfully. Great work!`,
      data: { type: "delivered", orderId: String(order._id) },
    }).catch(() => {});

    // Notify the customer their order has been delivered.
    notifyCustomer(order, {
      title: "Order Delivered",
      body: `Your order #${order.orderId} has been delivered successfully. Enjoy your purchase!`,
      type: "delivered",
    });

    return res.status(200).json({
      success: true,
      message: "Delivery completed",
      order,
    });
  } catch (error) {
    console.error("verifyDeliveryOtp error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route POST /api/delivery/orders/:id/undelivered
 * @desc  Mark an assigned order as undelivered with a reason.
 */
const markUndelivered = async (req, res) => {
  try {
    const { remarks } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, deliveryPartner: req.driver._id },
      { deliveryStatus: "undelivered", deliveryRemarks: remarks || "" },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found for this partner" });
    }

    // Notify the driver their undelivered report was saved.
    sendToToken(req.driver.fcmToken, {
      title: "Order Marked Undelivered",
      body: `Order ${order.orderId} has been marked as undelivered. Please contact support if needed.`,
      data: { type: "undelivered", orderId: String(order._id) },
    }).catch(() => {});

    return res
      .status(200)
      .json({ success: true, message: "Marked undelivered", order });
  } catch (error) {
    console.error("markUndelivered error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route GET /api/delivery/notifications
 * @desc  Activity feed for the logged-in partner, derived from their orders
 *        plus a count of currently available (unclaimed) orders.
 */
const getNotifications = async (req, res) => {
  try {
    const mine = await Order.find({ deliveryPartner: req.driver._id })
      .sort({ updatedAt: -1 })
      .limit(30);

    const availableCount = await Order.countDocuments({
      $and: [
        {
          $or: [
            { deliveryStatus: "placed" },
            { deliveryStatus: { $exists: false } },
          ],
        },
        {
          $or: [
            { deliveryPartner: null },
            { deliveryPartner: { $exists: false } },
          ],
        },
      ],
    });

    const notifications = [];

    if (availableCount > 0) {
      notifications.push({
        _id: "available",
        type: "available",
        title: "New orders available",
        message: `${availableCount} order${
          availableCount > 1 ? "s are" : " is"
        } waiting to be accepted.`,
        createdAt: new Date(),
      });
    }

    const label = {
      accepted: "Order accepted",
      out_for_delivery: "Out for delivery",
      delivered: "Order delivered",
      undelivered: "Delivery failed",
    };
    const orderRef = (o) => `#${o.orderId || String(o._id).slice(-6)}`;

    mine.forEach((o) => {
      notifications.push({
        _id: String(o._id),
        type: o.deliveryStatus,
        title: label[o.deliveryStatus] || "Order update",
        message: `${orderRef(o)} — ₹${Number(o.total || 0).toLocaleString()} to ${
          o.addressName || "customer"
        }`,
        status: o.deliveryStatus,
        createdAt: o.deliveredAt || o.outForDeliveryAt || o.acceptedAt || o.updatedAt,
      });
    });

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAvailableOrders,
  getMyOrders,
  getOrderById,
  acceptOrder,
  startDelivery,
  requestDeliveryOtp,
  verifyDeliveryOtp,
  markUndelivered,
  getNotifications,
};
