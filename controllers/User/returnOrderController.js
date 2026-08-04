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
      items,
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

// Admin: Get all return orders
exports.getAllReturnOrders = async (req, res) => {
  try {
    const returnOrders = await ReturnOrder.find({})
      .populate("user", "phone userDetails")
      .populate("order", "orderId total")
      .sort({ createdAt: -1 });

    res.set("Cache-Control", "no-store");
    res.status(200).json({ success: true, returnOrders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all return orders",
      error: error.message,
    });
  }
};

// Admin: Update return order status
exports.updateReturnOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const VALID_STATUSES = [
      "requested",
      "approved",
      "processing",
      "in-transit",
      "out-for-delivery",
      "delivered",
      "rejected",
      "refunded",
    ];

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const returnOrder = await ReturnOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!returnOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Return order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Return order status updated",
      returnOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating return order status",
      error: error.message,
    });
  }
};
