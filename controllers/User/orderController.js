const Order = require("../../models/User/orderModel");
const Driver = require("../../models/Delivery/driverModel");
const User = require("../../models/User/userModel");
const { sendToMany, sendToToken } = require("../../utils/push");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      addressName,
      addressContact,
      paymentMethod,
      orderNotes,
      subtotal,
      gst,
      total,
      orderId,
    } = req.body;

    if (!items || !deliveryAddress || !paymentMethod || !total) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const order = new Order({
      user: req.user._id,
      items,
      deliveryAddress,
      addressName,
      addressContact,
      paymentMethod,
      orderNotes,
      subtotal,
      gst,
      total,
      orderId,
    });

    await order.save();

    // Respond first, then send push notifications.
    res
      .status(201)
      .json({ success: true, message: "Order placed successfully", order });

    // 1. Notify the customer their order was placed successfully.
    try {
      const customer = await User.findById(req.user._id).select("fcmToken").lean();
      if (customer?.fcmToken) {
        await sendToToken(customer.fcmToken, {
          title: "Order Placed Successfully",
          body: `Your order #${orderId} worth \u20B9${total} has been placed. We'll notify you when it's accepted.`,
          data: { type: "placed", orderId: String(order._id), orderRef: orderId || "" },
        });
      }
    } catch (e) {}

    // 2. Broadcast to all active delivery partners.
    try {
      const drivers = await Driver.find({
        blockstatus: { $ne: true },
        fcmToken: { $exists: true, $ne: "" },
      }).select("fcmToken");
      const tokens = drivers.map((d) => d.fcmToken);
      await sendToMany(tokens, {
        title: "New order available",
        body: `Order ${orderId || ""} \u00B7 \u20B9${total} is ready to accept`,
        data: { type: "available" },
      });
    } catch (e) {}
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("deliveryPartner", "name phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const orders = await Order.find({})
      .populate("user", "phone userDetails")
      .populate("items.productId", "image name") // get fresh image from Product
      .populate("deliveryPartner", "name phone driverId") // who accepted it
      .sort({ createdAt: -1 });

    // Normalise item image: prefer live product image over stored value
    const normalised = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map((item) => {
        // productId is populated — use its image if available
        const liveImage = item.productId?.image;
        const storedImage = item.image;

        let resolvedImage = liveImage || storedImage || null;

        // Strip any absolute production URL prefix so frontend always gets a relative path
        if (resolvedImage) {
          resolvedImage = resolvedImage
            .replace(/^https?:\/\/[^/]+\//, "/") // https://domain.com/x → /x
            .replace(/^([^/])/, "/$1");           // products/x → /products/x
        }

        return { ...item, image: resolvedImage };
      });
      return orderObj;
    });

    res.status(200).json({ success: true, orders: normalised });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all orders",
      error: error.message,
    });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const VALID_STATUSES = [
      "confirmed",
      "processing",
      "in-transit",
      "out-for-delivery",
      "delivered",
      "rejected",
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Notify the customer about the status change (non-blocking).
    try {
      const statusMessages = {
        confirmed:        { title: "Order Confirmed",        body: `Your order #${order.orderId} has been confirmed and is being processed.` },
        processing:       { title: "Order Processing",       body: `Your order #${order.orderId} is currently being processed.` },
        "in-transit":     { title: "Order In Transit",       body: `Your order #${order.orderId} is in transit and on its way to you.` },
        "out-for-delivery": { title: "Out for Delivery",     body: `Your order #${order.orderId} is out for delivery. Expect it soon!` },
        delivered:        { title: "Order Delivered",        body: `Your order #${order.orderId} has been delivered. Thank you for shopping with us!` },
        rejected:         { title: "Order Rejected",         body: `Unfortunately, your order #${order.orderId} has been rejected. Please contact support.` },
      };
      const msg = statusMessages[status];
      if (msg) {
        const user = await User.findById(order.user).select("fcmToken").lean();
        if (user?.fcmToken) {
          sendToToken(user.fcmToken, {
            ...msg,
            data: { type: status, orderId: String(order._id) },
          }).catch(() => {});
        }
      }
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};
