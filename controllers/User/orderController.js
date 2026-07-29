const Order = require("../../models/User/orderModel");

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

    res
      .status(201)
      .json({ success: true, message: "Order placed successfully", order });
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
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
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
