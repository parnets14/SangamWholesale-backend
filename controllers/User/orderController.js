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
      // Fetch orders without population first
      const orders = await Order.find({ user: req.user._id })
        .populate("deliveryAddress")
        .sort({ createdAt: -1 });

      // Manually handle the population of products
      const populatedOrders = [];

      for (const order of orders) {
        const orderObj = order.toObject();
        const populatedItems = [];

        for (const item of orderObj.items) {
          try {
            // Find the product based on the productType
            let product = null;
            if (item.productType === "buyonce") {
              // Use the Product model to find buyonce products
              const productModel = mongoose.model("Product");
              product = await productModel
                .findById(item.product)
                .select("name price image");
            } else if (item.productType === "subscription") {
              // Also use the Product model for subscription products (adjust if needed)
              const productModel = mongoose.model("Product");
              product = await productModel
                .findById(item.product)
                .select("name price image");
            }

            // Add the product to the item
            populatedItems.push({
              ...item,
              product: product,
            });
          } catch (error) {
            // If there's an error finding the product, just add the item without population
            populatedItems.push(item);
          }
        }

        // Replace the items with populated items
        orderObj.items = populatedItems;
        populatedOrders.push(orderObj);
      }

      console.log(`Found ${orders.length} orders`);

      res.json({
        success: true,
        data: populatedOrders,
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

  //Get User Orders with full product details
  // Get User Orders with full product details
  // getUserOrders: async (req, res) => {
  //   try {
  //     // 1. First get orders with populated address
  //     const orders = await Order.find({ user: req.user._id })
  //       .populate({
  //         path: "deliveryAddress",
  //         select:
  //           "name phone address_line1 address_line2 city state postalCode",
  //       })
  //       .sort({ createdAt: -1 });

  //     // 2. Get all product IDs from all orders to minimize queries
  //     const allProductIds = {
  //       buyonce: [],
  //       subscription: [],
  //     };

  //     orders.forEach((order) => {
  //       order.items.forEach((item) => {
  //         if (item.productType === "buyonce") {
  //           allProductIds.buyonce.push(item.product);
  //         } else if (item.productType === "subscription") {
  //           allProductIds.subscription.push(item.product);
  //         }
  //       });
  //     });

  //     // 3. Fetch all products in bulk
  //     const Product = mongoose.model("Product");
  //     const SubscriptionProduct = mongoose.model("SubscriptionProduct"); // Adjust if different

  //     const [buyonceProducts, subscriptionProducts] = await Promise.all([
  //       Product.find({ _id: { $in: allProductIds.buyonce } }).select(
  //         "name description price image"
  //       ),
  //       SubscriptionProduct.find({
  //         _id: { $in: allProductIds.subscription },
  //       }).select("name description price image"),
  //     ]);

  //     // Create maps for quick lookup
  //     const buyonceProductMap = buyonceProducts.reduce((map, product) => {
  //       map[product._id.toString()] = product;
  //       return map;
  //     }, {});

  //     const subscriptionProductMap = subscriptionProducts.reduce(
  //       (map, product) => {
  //         map[product._id.toString()] = product;
  //         return map;
  //       },
  //       {}
  //     );

  //     // 4. Construct the response with populated products
  //     const populatedOrders = orders.map((order) => {
  //       const orderObj = order.toObject();

  //       orderObj.items = orderObj.items.map((item) => {
  //         const product =
  //           item.productType === "buyonce"
  //             ? buyonceProductMap[item.product.toString()]
  //             : subscriptionProductMap[item.product.toString()];

  //         return {
  //           ...item,
  //           product: product || { _id: item.product }, // Fallback if product not found
  //         };
  //       });

  //       return orderObj;
  //     });

  //     res.json({
  //       success: true,
  //       data: populatedOrders,
  //     });
  //   } catch (error) {
  //     console.error("Get orders error:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to fetch orders",
  //       error: error.message,
  //     });
  //   }
  // },
  // Get Order Details
  getOrderDetails: async (req, res) => {
    console.log("Fetching order details...");
    try {
      const { orderId } = req.params;

      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
      }).populate("deliveryAddress");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Manually populate the products
      const orderObj = order.toObject();
      const populatedItems = [];

      for (const item of orderObj.items) {
        try {
          // Find the product based on the productType
          let product = null;
          if (item.productType === "buyonce") {
            const productModel = mongoose.model("Product");
            product = await productModel
              .findById(item.product)
              .select("name price image");
          } else if (item.productType === "subscription") {
            const productModel = mongoose.model("Product");
            product = await productModel
              .findById(item.product)
              .select("name price image");
          }

          // Add the product to the item
          populatedItems.push({
            ...item,
            product: product,
          });
        } catch (error) {
          populatedItems.push(item);
        }
      }

      // Replace the items with populated items
      orderObj.items = populatedItems;

      res.json({
        success: true,
        data: orderObj,
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
};

module.exports = orderController;
