const ReturnOrder = require("../../models/User/returnOrderModel");
const Order = require("../../models/User/orderModel");

// Create a return order
exports.createReturnOrder = async (req, res) => {
  try {
    const { orderId, items, comment } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and items are required" });
    }

    // Optionally: check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Create the return order
    const returnOrder = new ReturnOrder({
      order: orderId,
      user: req.user._id,
      items, // [{ productId, name, sku, image, quantity, reason }]
      comment,
      status: "requested",
    });

    await returnOrder.save();

    res
      .status(201)
      .json({ success: true, message: "Return order created", returnOrder });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating return order",
      error: error.message,
    });
  }
};

// Get all return orders for a user
exports.getUserReturnOrders = async (req, res) => {
  try {
    const returnOrders = await ReturnOrder.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, returnOrders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching return orders",
      error: error.message,
    });
  }
};

// Get a single return order by ID
exports.getReturnOrderById = async (req, res) => {
  try {
    const returnOrder = await ReturnOrder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!returnOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Return order not found" });
    }
    res.status(200).json({ success: true, returnOrder });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching return order",
      error: error.message,
    });
  }
};
