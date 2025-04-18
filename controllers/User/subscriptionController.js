// controllers/subscriptionController.js
const Subscription = require("../../models/User/subscriptionModel");
const Product = require("../../models/Admin/productModel");
const Order = require("../../models/User/orderModel");
const Address = require("../../models/User/addressModel");

// Create new subscription
const createSubscription = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      frequency,
      customDays,
      intervalDays,
      startDate,
      deliverySlot,
      addressId,
    } = req.body;

    // Validate required fields
    if (!productId || !frequency || !startDate || !deliverySlot || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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

    // Validate frequency specific fields
    if (frequency === "custom" && (!customDays || customDays.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Custom days are required for custom frequency",
      });
    }

    if (frequency === "interval" && !intervalDays) {
      return res.status(400).json({
        success: false,
        message: "Interval days are required for interval frequency",
      });
    }

    // Parse start date
    const parsedStartDate = new Date(startDate);

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      product: productId,
      quantity: quantity || 1,
      frequency,
      customDays: frequency === "custom" ? customDays : [],
      intervalDays: frequency === "interval" ? intervalDays : null,
      startDate: parsedStartDate,
      nextDeliveryDate: parsedStartDate,
      deliverySlot: {
        start: deliverySlot.split("-")[0],
        end: deliverySlot.split("-")[1],
      },
      status: "active",
      address: addressId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        size: req.body.size || product.sizes[0],
        unit: req.body.unit || product.units[0],
        image: product.image,
      },
    });

    // Create first order for this subscription
    const order = await Order.create({
      user: req.user._id,
      items: [
        {
          product: productId,
          quantity: quantity || 1,
          price: product.price,
          name: product.name,
          size: req.body.size || product.sizes[0],
          unit: req.body.unit || product.units[0],
        },
      ],
      totalAmount: product.price * (quantity || 1),
      orderType: "subscription",
      subscription: subscription._id,
      deliveryAddress: addressId,
      deliveryDate: parsedStartDate,
      deliverySlot: {
        start: deliverySlot.split("-")[0],
        end: deliverySlot.split("-")[1],
      },
    });

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription,
      firstOrder: order,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

// Get user's subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate("product", "name price image")
      .populate("address");

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};

// Pause subscription
const pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.status = "paused";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription paused successfully",
      subscription,
    });
  } catch (error) {
    console.error("Pause subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to pause subscription",
      error: error.message,
    });
  }
};

// Resume subscription
const resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.status = "active";
    // Set next delivery date to tomorrow if it's in the past
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (subscription.nextDeliveryDate < new Date()) {
      subscription.nextDeliveryDate = tomorrow;
    }
    
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription resumed successfully",
      subscription,
    });
  } catch (error) {
    console.error("Resume subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resume subscription",
      error: error.message,
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.status = "cancelled";
    await subscription.save();

    // Cancel any pending orders for this subscription
    await Order.updateMany(
      {
        subscription: id,
        status: "pending",
      },
      {
        status: "cancelled",
      }
    );

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};

// Set vacation mode
const setVacationMode = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.isVacationMode = true;
    subscription.vacationDetails = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    // Calculate next delivery date after vacation
    const vacationEndDate = new Date(endDate);
    vacationEndDate.setDate(vacationEndDate.getDate() + 1);
    
    if (vacationEndDate > subscription.nextDeliveryDate) {
      subscription.nextDeliveryDate = vacationEndDate;
    }

    await subscription.save();

    // Cancel any pending orders during vacation period
    await Order.updateMany(
      {
        subscription: id,
        status: "pending",
        deliveryDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
      {
        status: "cancelled",
      }
    );

    res.status(200).json({
      success: true,
      message: "Vacation mode set successfully",
      subscription,
    });
  } catch (error) {
    console.error("Set vacation mode error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set vacation mode",
      error: error.message,
    });
  }
};

// Cancel vacation mode
const cancelVacationMode = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.isVacationMode = false;
    subscription.vacationDetails = {
      startDate: null,
      endDate: null,
    };

    // Update next delivery date to tomorrow if needed
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (subscription.nextDeliveryDate < new Date()) {
      subscription.nextDeliveryDate = tomorrow;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Vacation mode cancelled successfully",
      subscription,
    });
  } catch (error) {
    console.error("Cancel vacation mode error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel vacation mode",
      error: error.message,
    });
  }
};

// Update subscription details
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      frequency,
      customDays,
      intervalDays,
      deliverySlot,
      addressId,
    } = req.body;

    const subscription = await Subscription.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Update fields if provided
    if (quantity) subscription.quantity = quantity;
    
    if (frequency) {
      subscription.frequency = frequency;
      
      // Reset frequency-specific fields
      subscription.customDays = [];
      subscription.intervalDays = null;
      
      // Set new frequency-specific fields
      if (frequency === "custom" && customDays && customDays.length > 0) {
        subscription.customDays = customDays;
      }
      
      if (frequency === "interval" && intervalDays) {
        subscription.intervalDays = intervalDays;
      }
      
      // Recalculate next delivery date
      subscription.nextDeliveryDate = subscription.calculateNextDeliveryDate();
    }
    
    if (deliverySlot) {
      subscription.deliverySlot = {
        start: deliverySlot.split("-")[0],
        end: deliverySlot.split("-")[1],
      };
    }
    
    if (addressId) {
      // Verify address exists
      const address = await Address.findById(addressId);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }
      subscription.address = addressId;
    }

    await subscription.save();

    // Update any pending orders for this subscription
    if (quantity || deliverySlot || addressId) {
      const pendingOrders = await Order.find({
        subscription: id,
        status: "pending",
      });

      for (const order of pendingOrders) {
        if (quantity) {
          order.items[0].quantity = quantity;
          order.totalAmount = order.items[0].price * quantity;
        }
        
        if (deliverySlot) {
          order.deliverySlot = {
            start: deliverySlot.split("-")[0],
            end: deliverySlot.split("-")[1],
          };
        }
        
        if (addressId) {
          order.deliveryAddress = addressId;
        }
        
        await order.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subscription",
      error: error.message,
    });
  }
};

module.exports = {
  createSubscription,
  getUserSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  setVacationMode,
  cancelVacationMode,
  updateSubscription,
};