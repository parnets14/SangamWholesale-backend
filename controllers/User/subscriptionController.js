const Subscription = require("../../models/User/subscriptionModel");
const Product = require("../../models/Admin/productModel");
const User = require("../../models/User/userModel");
const Address = require("../../models/User/addressModel");

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const { userId, Subscriptions, totalAmount } = req.body;
    console.log(" req.body", req.body);
    
    // Validate user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Process each subscription item
    for (const sub of Subscriptions) {
      // Set subscriptionStatus to Active and status to upcoming by default
      sub.subscriptionStatus = "Active";
      sub.status = "upcoming";

      // Validate product exists
      const product = await Product.findById(sub.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${sub.productId} not found` });
      }

      // Validate address exists
      const address = await Address.findById(sub.addressId);
      if (!address) {
        return res
          .status(404)
          .json({ error: `Address ${sub.addressId} not found` });
      }

      // Frequency-specific validation & set default values for required fields
      if (sub.frequency === "Every Day") {
        if (!sub.deliveryDate) {
          return res.status(400).json({
            error: "Delivery date is required for daily frequency",
          });
        }

        // Set default dates for "Every Day" frequency
        const today = new Date();
        if (!sub.startDate) {
          sub.startDate = today.toISOString().split("T")[0];
        }
        if (!sub.endDate) {
          const oneYearLater = new Date(today);
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
          sub.endDate = oneYearLater.toISOString().split("T")[0];
        }
      } else if (sub.frequency === "On Interval") {
        if (!sub.repeatInterval) {
          return res.status(400).json({
            error: "Repeat interval required for interval frequency",
          });
        }
        if (!sub.startDate) {
          return res.status(400).json({
            error: "Start date is required for interval frequency",
          });
        }
        if (!sub.endDate) {
          const startDate = new Date(sub.startDate);
          const oneYearLater = new Date(startDate);
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
          sub.endDate = oneYearLater.toISOString().split("T")[0];
        }
      } else if (sub.frequency === "Custom") {
        const hasDayWithQuantity = Object.values(sub.days || {}).some(
          (day) => day.quantity > 0
        );
        if (!hasDayWithQuantity) {
          return res.status(400).json({
            error: "At least one day must be selected with quantity for custom frequency",
          });
        }
        if (!sub.startDate) {
          return res.status(400).json({
            error: "Start date is required for custom frequency",
          });
        }
        if (!sub.endDate) {
          const startDate = new Date(sub.startDate);
          const oneYearLater = new Date(startDate);
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
          sub.endDate = oneYearLater.toISOString().split("T")[0];
        }
      }
    }

    const subscription = new Subscription({
      userId,
      Subscriptions,
      totalAmount,
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all subscriptions (admin only)
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("userId", "name email")
      .populate("Subscriptions.productId", "name price")
      .populate("Subscriptions.addressId");

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subscriptions for a specific user
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const subscriptions = await Subscription.find({ userId })
      .populate("Subscriptions.productId", "name price image")
      .populate("Subscriptions.addressId");

    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json({ message: "No subscriptions found for this user" });
    }

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const subscription = await Subscription.findById(subscriptionId)
      .populate("userId", "name email")
      .populate("Subscriptions.productId", "name price description")
      .populate("Subscriptions.addressId");

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const updates = req.body;

    const existingSubscription = await Subscription.findById(subscriptionId);
    if (!existingSubscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Validate updates if provided
    if (updates.Subscriptions) {
      for (const sub of updates.Subscriptions) {
        if (sub.productId) {
          const product = await Product.findById(sub.productId);
          if (!product) {
            return res
              .status(404)
              .json({ error: `Product ${sub.productId} not found` });
          }
        }

        if (sub.addressId) {
          const address = await Address.findById(sub.addressId);
          if (!address) {
            return res
              .status(404)
              .json({ error: `Address ${sub.addressId} not found` });
          }
        }

        if (
          sub.startDate &&
          sub.endDate &&
          new Date(sub.startDate) >= new Date(sub.endDate)
        ) {
          return res
            .status(400)
            .json({ error: "Start date must be before end date" });
        }
      }
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updates,
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("Subscriptions.productId", "name price")
      .populate("Subscriptions.addressId");

    res.status(200).json(updatedSubscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update subscription item status
const updateSubscriptionItemStatus = async (req, res) => {
  try {
    const { subscriptionId, itemId } = req.params;
    const { subscriptionStatus } = req.body;

    if (!["Active", "InActive"].includes(subscriptionStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const item = subscription.Subscriptions.id(itemId);
    if (!item) {
      return res.status(404).json({ error: "Subscription item not found" });
    }

    item.status = subscriptionStatus;
    await subscription.save();

    res.status(200).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const deletedSubscription = await Subscription.findByIdAndDelete(
      subscriptionId
    );

    if (!deletedSubscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active subscriptions (where endDate is in future)
const getActiveSubscriptions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscriptions = await Subscription.find({
      userId,
      "Subscriptions.endDate": { $gte: today },
      "Subscriptions.status": { $ne: "cancelled" },
    })
      .populate("Subscriptions.productId", "name price image")
      .populate("Subscriptions.addressId");

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: "No active subscriptions found" });
    }

    // Filter only active items
    const result = subscriptions
      .map((sub) => ({
        ...sub.toObject(),
        Subscriptions: sub.Subscriptions.filter(
          (item) =>
            new Date(item.endDate) >= today && item.status !== "cancelled"
        ),
      }))
      .filter((sub) => sub.Subscriptions.length > 0);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionItemStatus,
  deleteSubscription,
  getActiveSubscriptions,
};
