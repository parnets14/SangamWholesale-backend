// controllers/orderController.js
const Order = require("../../models/User/buyonceModel");
const Product = require("../../models/Admin/productModel");
const Address = require("../../models/User/addressModel");

// Create one-time order
const createOrder = async (req, res) => {
  try {
    const { items, deliveryDate, deliverySlot, addressId, paymentMethod } =
      req.body;

    // Validate required fields
    if (
      !items ||
      !items.length ||
      !deliveryDate ||
      !deliverySlot ||
      !addressId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate address exists
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Process items and calculate total
    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      orderItems.push({
        product: item.productId,
        quantity: item.quantity || 1,
        price: product.price,
        name: product.name,
        size: item.size || product.sizes[0],
        unit: item.unit || product.units[0],
      });

      totalAmount += product.price * (item.quantity || 1);
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      orderType: "one-time",
      deliveryAddress: addressId,
      deliveryDate: new Date(deliveryDate),
      deliverySlot: {
        start: deliverySlot.split("-")[0],
        end: deliverySlot.split("-")[1],
      },
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending", // If payment gateway, update after payment
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: req.user._id })
      .populate("items.product", "name image")
      .populate("deliveryAddress")
      .populate("subscription");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (["delivered", "out-for-delivery", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in ${order.status} status`,
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
};
