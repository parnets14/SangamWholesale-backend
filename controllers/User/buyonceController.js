const Buyonce = require("../../models/User/buyonceModel");
const Product = require("../../models/Admin/productModel");
const User = require("../../models/User/userModel");
const Address = require("../../models/User/addressModel");

// Create a new BuyOnce order
const createBuyonceOrder = async (req, res) => {
  try {
    const { user, order } = req.body;

    // Validate user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate each product in the order and set subscriptionStatus
    for (const item of order) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.productId} not found` });
      }

      // Validate address exists
      const address = await Address.findById(item.address);
      if (!address) {
        return res
          .status(404)
          .json({ error: `Address ${item.address} not found` });
      }

      // Validate delivery date
      if (!item.deliveryDate || isNaN(new Date(item.deliveryDate))) {
        return res.status(400).json({ error: "Invalid delivery date" });
      }

      // Set subscriptionStatus to Active by default
      item.subscriptionStatus = "Active";
      item.status = "upcoming";
    }

    const buyonceOrder = new Buyonce({ user, order });
    await buyonceOrder.save();

    res.status(201).json(buyonceOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all BuyOnce orders (admin only)
const getAllBuyonceOrders = async (req, res) => {
  try {
    const orders = await Buyonce.find()
      .populate("user", "name email")
      .populate("order.productId", "name price image description")
      .populate("order.address")
      .select({
        "order.subscriptionStatus": 1,
        "order.status": 1,
        "order.productId": 1,
        "order.quantity": 1,
        "order.deliveryTime": 1,
        "order.deliveryDate": 1,
        "order.address": 1,
        "order.orderType": 1,
        user: 1,
        createdAt: 1,
        updatedAt: 1
      });

    // Transform the response to include all necessary fields
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      order: order.order.map(item => ({
        ...item,
        subscriptionStatus: item.subscriptionStatus || "Active",
        status: item.status || "upcoming"
      }))
    }));

    res.status(200).json({
      success: true,
      data: transformedOrders
    });
  } catch (error) {
    console.error("Error in getAllBuyonceOrders:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get Upcoming BuyOnce orders
const getUpcomingBuyonceOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Buyonce.find({
      user: userId,
      "order.deliveryDate": { $gte: today }
    })
      .populate({
        path: "order.productId",
        select: "name price image description"
      })
      .populate("order.address");

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming orders found",
        data: []
      });
    }

    // Transform and filter the response
    const transformedOrders = orders.flatMap(order => 
      order.order
        .filter(item => new Date(item.deliveryDate) >= today)
        .map(item => ({
          type: item.orderType || "buyonce",
          id: item._id,
          product: {
            _id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image
          },
          quantity: item.quantity,
          status: item.status || "upcoming",
          subscriptionStatus: item.subscriptionStatus || "Active",
          deliveryDate: item.deliveryDate,
          address: item.address,
          createdAt: order.createdAt
        }))
    );

    res.status(200).json({
      success: true,
      data: transformedOrders
    });
  } catch (error) {
    console.error("Error in getUpcomingBuyonceOrders:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get BuyOnce orders for a specific user
const getUserBuyonceOrders = async (req, res) => {
  try {
    const userId = req.user._id; // Get from auth middleware (not params)
    console.log("Authenticated userId:", userId);

    const orders = await Buyonce.find({ user: userId })
      .populate("order.productId", "name price image description")
      .populate("order.address")
      .select({
        "order.subscriptionStatus": 1,
        "order.status": 1,
        "order.productId": 1,
        "order.quantity": 1,
        "order.deliveryTime": 1,
        "order.deliveryDate": 1,
        "order.address": 1,
        "order.orderType": 1,
        createdAt: 1,
        updatedAt: 1
      });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found for this user",
        userId,
        data: []
      });
    }

    // Transform the response to include all necessary fields
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      order: order.order.map(item => ({
        ...item,
        subscriptionStatus: item.subscriptionStatus || "Active", // Ensure subscriptionStatus is included
        status: item.status || "upcoming" // Ensure status is included
      }))
    }));

    res.status(200).json({
      success: true,
      data: transformedOrders
    });
  } catch (error) {
    console.error("Error in getUserBuyonceOrders:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a single BuyOnce order by ID
const getBuyonceOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Buyonce.findById(orderId)
      .populate("user", "name email")
      .populate("order.productId", "name price image description")
      .populate("order.address")
      .select({
        "order.subscriptionStatus": 1,
        "order.status": 1,
        "order.productId": 1,
        "order.quantity": 1,
        "order.deliveryTime": 1,
        "order.deliveryDate": 1,
        "order.address": 1,
        "order.orderType": 1,
        user: 1,
        createdAt: 1,
        updatedAt: 1
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    // Transform the response to include all necessary fields
    const transformedOrder = {
      ...order.toObject(),
      order: order.order.map(item => ({
        ...item,
        subscriptionStatus: item.subscriptionStatus || "Active",
        status: item.status || "upcoming"
      }))
    };

    res.status(200).json({
      success: true,
      data: transformedOrder
    });
  } catch (error) {
    console.error("Error in getBuyonceOrderById:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a BuyOnce order
const updateBuyonceOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updates = req.body;

    // Validate products if they're being updated
    if (updates.order) {
      for (const item of updates.order) {
        if (item.productId) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res
              .status(404)
              .json({ error: `Product ${item.productId} not found` });
          }
        }

        if (item.address) {
          const address = await Address.findById(item.address);
          if (!address) {
            return res
              .status(404)
              .json({ error: `Address ${item.address} not found` });
          }
        }

        if (
          item.startDate &&
          item.endDate &&
          new Date(item.startDate) > new Date(item.endDate)
        ) {
          return res
            .status(400)
            .json({ error: "Start date cannot be after end date" });
        }
      }
    }

    const updatedOrder = await Buyonce.findByIdAndUpdate(orderId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("order.productId", "name price")
      .populate("order.address");

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update status of a specific order item
const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (
      !["onhold", "delivered", "upcoming", "vacation", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Buyonce.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const itemIndex = order.order.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Order item not found" });
    }

    order.order[itemIndex].status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a BuyOnce order
const deleteBuyonceOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const deletedOrder = await Buyonce.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBuyonceOrder,
  getAllBuyonceOrders,
  getUserBuyonceOrders,
  getBuyonceOrderById,
  updateBuyonceOrder,
  updateOrderItemStatus,
  deleteBuyonceOrder,
  getUpcomingBuyonceOrders,
};
