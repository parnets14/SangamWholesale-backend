const Subscription = require("../../models/User/subscriptionModel");
const Product = require("../../models/Admin/productModel");
const User = require("../../models/User/userModel");
const Address = require("../../models/User/addressModel");

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const { user, Subscriptions } = req.body;

    // Validate user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate each subscription item
    for (const sub of Subscriptions) {
      // Validate product exists
      const product = await Product.findById(sub.product);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${sub.product} not found` });
      }

      // Validate address exists
      const address = await Address.findById(sub.address);
      if (!address) {
        return res
          .status(404)
          .json({ error: `Address ${sub.address} not found` });
      }

      // Validate dates
      if (new Date(sub.startDate) >= new Date(sub.endDate)) {
        return res
          .status(400)
          .json({ error: "Start date must be before end date" });
      }

      // Validate frequency-specific fields
      if (
        sub.frequency === "custom" &&
        (!sub.customDays || sub.customDays.length === 0)
      ) {
        return res
          .status(400)
          .json({ error: "Custom days required for custom frequency" });
      }

      if (sub.frequency === "interval" && !sub.intervalDays) {
        return res
          .status(400)
          .json({ error: "Interval days required for interval frequency" });
      }
    }

    const subscription = new Subscription({ user, Subscriptions });
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
      .populate("user", "name email")
      .populate("Subscriptions.product", "name price")
      .populate("Subscriptions.address");

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subscriptions for a specific user
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.params.userId;

    const subscriptions = await Subscription.find({ user: userId })
      .populate("Subscriptions.product", "name price image")
      .populate("Subscriptions.address");

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
      .populate("user", "name email")
      .populate("Subscriptions.product", "name price description")
      .populate("Subscriptions.address");

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

    // Validate if subscription exists
    const existingSubscription = await Subscription.findById(subscriptionId);
    if (!existingSubscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Validate updates if provided
    if (updates.Subscriptions) {
      for (const sub of updates.Subscriptions) {
        if (sub.product) {
          const product = await Product.findById(sub.product);
          if (!product) {
            return res
              .status(404)
              .json({ error: `Product ${sub.product} not found` });
          }
        }

        if (sub.address) {
          const address = await Address.findById(sub.address);
          if (!address) {
            return res
              .status(404)
              .json({ error: `Address ${sub.address} not found` });
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
      .populate("user", "name email")
      .populate("Subscriptions.product", "name price")
      .populate("Subscriptions.address");

    res.status(200).json(updatedSubscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update status of a specific subscription item
const updateSubscriptionItemStatus = async (req, res) => {
  try {
    const { subscriptionId, itemId } = req.params;
    const { status } = req.body;

    if (
      !["onhold", "delivered", "upcoming", "vacation", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const itemIndex = subscription.Subscriptions.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Subscription item not found" });
    }

    subscription.Subscriptions[itemIndex].status = status;
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
      user: userId,
      "Subscriptions.endDate": { $gte: today },
    })
      .populate("Subscriptions.product", "name price image")
      .populate("Subscriptions.address");

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: "No active subscriptions found" });
    }

    // Filter only active subscription items
    const result = subscriptions
      .map((sub) => ({
        ...sub.toObject(),
        Subscriptions: sub.Subscriptions.filter(
          (item) => new Date(item.endDate) >= today
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
