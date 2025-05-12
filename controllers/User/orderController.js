// controllers/User/orderController.js
const Order = require("../../models/User/orderModel");
const Buyonce = require("../../models/User/buyonceModel");
const Subscription = require("../../models/User/subscriptionModel");
const Address = require("../../models/User/addressModel");
const Wallet = require("../../models/User/walletModel");



const orderController = {
  // Place Order
  confirmOrder: async (req, res) => {
    console.log("Starting order confirmation process...");
    try {
      const { addressId, paymentMethod } = req.body;
      const userId = req.user._id;

      console.log("Order request:", {
        userId,
        addressId,
        paymentMethod,
      });

      // 1. Get cart items from Buyonce and Subscription models (like in cartController)
      const buyonceOrders = await Buyonce.find({
        user: userId,
        "order.status": "upcoming", // Only include pending/upcoming items
      }).populate({
        path: "order.productId",
        select: "name price image",
      });

      const subscriptions = await Subscription.find({
        userId: userId,
        "Subscriptions.status": "upcoming", // Only include pending/upcoming items
      }).populate({
        path: "Subscriptions.productId",
        select: "name price image",
      });

      // Check if cart is empty
      const buyonceItemsCount = buyonceOrders.reduce(
        (count, order) => count + order.order.length,
        0
      );
      const subscriptionItemsCount = subscriptions.reduce(
        (count, sub) => count + sub.Subscriptions.length,
        0
      );

      if (buyonceItemsCount === 0 && subscriptionItemsCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Your cart is empty",
        });
      }

      console.log("Cart items found:", {
        buyonceItems: buyonceItemsCount,
        subscriptionItems: subscriptionItemsCount,
      });

      // 2. Validate address
      const address = await Address.findOne({
        _id: addressId,
        user: userId,
      });

      if (!address) {
        return res.status(400).json({
          success: false,
          message: "Invalid delivery address",
        });
      }

      // 3. Calculate totals
      console.log("Calculating order totals...");
      let totalAmount = 0;
      const orderItems = [];

      // Process buyonce items
      buyonceOrders.forEach((order) => {
        order.order.forEach((item) => {
          if (item.status === "upcoming") {
            const itemPrice = item.productId.price;
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
              productType: "buyonce",
              product: item.productId._id,
              quantity: item.quantity,
              price: itemPrice,
              subscriptionStatus: "Active"
            });
          }
        });
      });

      // Process subscription items
      subscriptions.forEach((sub) => {
        sub.Subscriptions.forEach((item) => {
          if (item.status === "upcoming") {
            const itemPrice = item.productId.price;
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
              productType: "subscription",
              product: item.productId._id,
              quantity: item.quantity,
              price: itemPrice,
              subscriptionStatus: "Active"
            });
          }
        });
      });

      // Apply discount (if any) - you might need to implement this
      const discount = 0; // Placeholder
      const finalAmount = totalAmount - discount;

      console.log("Order calculations:", {
        totalAmount,
        discount,
        finalAmount,
        itemCount: orderItems.length,
      });

      // 4. Handle wallet payment if selected
      if (paymentMethod === "wallet") {
        console.log("Processing wallet payment...");
        const wallet = await Wallet.findOne({ user: userId });

        if (!wallet || wallet.balance < finalAmount) {
          return res.status(400).json({
            success: false,
            message: "Insufficient wallet balance",
          });
        }

        // Deduct from wallet
        wallet.balance -= finalAmount;
        await wallet.save();
        console.log("Wallet balance updated:", wallet.balance);
      }

      // 5. Create order
      console.log("Creating order...");
      const order = await Order.create({
        user: userId,
        items: orderItems,
        deliveryAddress: addressId,
        totalAmount,
        discount,
        finalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === "wallet" ? "completed" : "pending",
        deliverySlot: "morning", // Default value or get from request
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow or get from request
      });

      console.log("Order created:", {
        orderId: order._id,
        status: order.orderStatus,
      });

      // 6. Remove ordered items from original models
      console.log("Removing items from cart...");
      // Remove buyonce items
      for (const buyonceOrder of buyonceOrders) {
        const orderItemIds = buyonceOrder.order
          .filter((item) => item.status === "upcoming")
          .map((item) => item._id);

        if (orderItemIds.length > 0) {
          await Buyonce.updateOne(
            { _id: buyonceOrder._id },
            { $pull: { order: { _id: { $in: orderItemIds } } } }
          );

          // If no items left, delete the entire document
          const updatedOrder = await Buyonce.findById(buyonceOrder._id);
          if (updatedOrder && updatedOrder.order.length === 0) {
            await Buyonce.findByIdAndDelete(buyonceOrder._id);
          }
        }
      }

      // Remove subscription items
      for (const subscription of subscriptions) {
        const subscriptionItemIds = subscription.Subscriptions.filter(
          (item) => item.status === "upcoming"
        ).map((item) => item._id);

        if (subscriptionItemIds.length > 0) {
          await Subscription.updateOne(
            { _id: subscription._id },
            { $pull: { Subscriptions: { _id: { $in: subscriptionItemIds } } } }
          );

          // If no items left, delete the entire document
          const updatedSubscription = await Subscription.findById(
            subscription._id
          );
          if (
            updatedSubscription &&
            updatedSubscription.Subscriptions.length === 0
          ) {
            await Subscription.findByIdAndDelete(subscription._id);
          }
        }
      }

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: order._id,
          totalAmount,
          discount,
          finalAmount,
          paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      });
    } catch (error) {
      console.error("Order confirmation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to place order",
        error: error.message,
      });
    }
  },

  // Get User Orders
  getUserOrders: async (req, res) => {
    console.log("Fetching user orders...");
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate("deliveryAddress")
        .populate({
          path: "items.product",
          select: "name price image description category"
        })
        .select({
          "items.subscriptionStatus": 1,
          "items.productType": 1,
          "items.product": 1,
          "items.quantity": 1,
          "items.price": 1,
          "deliveryAddress": 1,
          "totalAmount": 1,
          "orderStatus": 1,
          "deliverySlot": 1,
          "deliveryDate": 1,
          "createdAt": 1
        })
        .sort({ createdAt: -1 });

      console.log(`Found ${orders.length} orders`);

      // Transform response to ensure subscriptionStatus
      const transformedOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.map(item => ({
          ...item,
          subscriptionStatus: item.subscriptionStatus || "Active"
        }))
      }));

      res.json({
        success: true,
        data: transformedOrders
      });
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  },

  // Get Order Details
  getOrderDetails: async (req, res) => {
    console.log("Fetching order details...");
    try {
      const { orderId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
      })
      .populate("deliveryAddress")
      .populate({
        path: "items.product",
        select: "name price image description category"
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get order details error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order details",
        error: error.message,
      });
    }
  },

  // Update Order Status
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;

      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Update the order status
      order.orderStatus = orderStatus;
      await order.save();

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: order
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message
      });
    }
  },

  // Add this new controller function
  updateItemSubscriptionStatus: async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const { subscriptionStatus } = req.body;

      if (!["Active", "InActive"].includes(subscriptionStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription status"
        });
      }

      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Find the item by product ID instead of using the subdocument ID method
      const itemIndex = order.items.findIndex(item => 
        item.product.toString() === itemId || 
        (item.product._id && item.product._id.toString() === itemId)
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Order item not found"
        });
      }

      // Update the subscription status
      order.items[itemIndex].subscriptionStatus = subscriptionStatus;
      await order.save();

      res.json({
        success: true,
        message: "Subscription status updated successfully",
        data: order
      });
    } catch (error) {
      console.error("Update subscription status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update subscription status",
        error: error.message
      });
    }
  },

  // Add this new controller function for canceling order items
   cancelOrderItem: async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const userId = req.user._id;

      const order = await Order.findOne({
        _id: orderId,
        user: userId
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Find the specific item
      const item = order.items.id(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Order item not found"
        });
      }

      // Check if order can be cancelled (you might want to add more conditions)
      if (order.orderStatus === "delivered") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel delivered order"
        });
      }

      // Update order item status
      item.subscriptionStatus = "InActive";
      order.orderStatus = "cancelled";

      // If it's a wallet payment, refund the amount
      if (order.paymentMethod === "wallet" && order.paymentStatus === "completed") {
        const wallet = await Wallet.findOne({ user: userId });
        if (wallet) {
          wallet.balance += (item.price * item.quantity);
          await wallet.save();
        }
      }

      await order.save();

      res.json({
        success: true,
        message: "Order item cancelled successfully",
        data: {
          order,
          refunded: order.paymentMethod === "wallet" ? (item.price * item.quantity) : 0
        }
      });

    } catch (error) {
      console.error("Cancel order item error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order item",
        error: error.message
      });
    }
  },

  // Add this new controller function for deleting order items
  deleteOrderItem: async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const userId = req.user._id;

      const order = await Order.findOne({
        _id: orderId,
        user: userId
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Find the item index by matching the product ID
      const itemIndex = order.items.findIndex(item => 
        item.product.toString() === itemId || 
        (item.product._id && item.product._id.toString() === itemId)
      );
      
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Order item not found"
        });
      }

      // Get the item before removing it
      const item = order.items[itemIndex];

      // Remove the item from the items array
      order.items.splice(itemIndex, 1);

      // If no items left, delete the entire order
      if (order.items.length === 0) {
        await Order.findByIdAndDelete(orderId);
        return res.json({
          success: true,
          message: "Order deleted as no items remaining",
        });
      }

      // Recalculate order totals
      order.totalAmount -= (item.price * item.quantity);
      order.finalAmount = order.totalAmount - order.discount;

      // If it was a wallet payment, refund the amount
      if (order.paymentMethod === "wallet" && order.paymentStatus === "completed") {
        const wallet = await Wallet.findOne({ user: userId });
        if (wallet) {
          wallet.balance += (item.price * item.quantity);
          await wallet.save();
        }
      }

      await order.save();

      res.json({
        success: true,
        message: "Order item deleted successfully",
        data: {
          order,
          refunded: order.paymentMethod === "wallet" ? (item.price * item.quantity) : 0
        }
      });

    } catch (error) {
      console.error("Delete order item error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete order item",
        error: error.message
      });
    }
  },
};

module.exports = orderController;
