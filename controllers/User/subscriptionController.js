const Subscription = require("../../models/User/subscriptionModel");
const Product = require("../../models/Admin/productModel");
const Address = require("../../models/User/addressModel");

// Create new subscription
exports.createSubscription = async (req, res) => {
  try {
    const { items, shippingAddress, schedule, couponApplied } = req.body;

    // Validate product exists
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
    }

    // Validate address belongs to user
    const address = await Address.findOne({
      _id: shippingAddress,
      user: req.user._id
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const subscription = new Subscription({
      user: req.user._id,
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
        discount: item.discount || 0
      })),
      shippingAddress,
      schedule,
      couponApplied,
      status: "active"
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error creating subscription", error });
  }
};

// Get all user subscriptions
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate("items.product")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error });
  }
};

// Get single subscription
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate("items.product")
      .populate("shippingAddress");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscription", error });
  }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { items, shippingAddress, schedule, status } = req.body;

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (items) {
      // Validate products exist
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
      }
      subscription.items = items;
    }

    if (shippingAddress) {
      // Validate address belongs to user
      const address = await Address.findOne({
        _id: shippingAddress,
        user: req.user._id
      });
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      subscription.shippingAddress = shippingAddress;
    }

    if (schedule) {
      subscription.schedule = schedule;
      // Recalculate next delivery if schedule changed
      subscription.calculateNextDelivery();
    }

    if (status) {
      subscription.status = status;
    }

    subscription.lastModified = Date.now();
    await subscription.save();

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription", error });
  }
};

// Pause subscription
exports.pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: "active"
      },
      { status: "paused", lastModified: Date.now() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Active subscription not found" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error pausing subscription", error });
  }
};

// Resume subscription
exports.resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: "paused"
      },
      { status: "active", lastModified: Date.now() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Paused subscription not found" });
    }

    // Recalculate next delivery date
    subscription.calculateNextDelivery();
    await subscription.save();

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error resuming subscription", error });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        status: { $in: ["active", "paused"] }
      },
      { status: "cancelled", lastModified: Date.now() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found or already cancelled" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error cancelling subscription", error });
  }
};

// Get upcoming deliveries
exports.getUpcomingDeliveries = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user._id,
      status: "active",
      nextDeliveryDate: { $gte: new Date() }
    })
      .populate("items.product")
      .populate("shippingAddress")
      .sort({ nextDeliveryDate: 1 });

    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming deliveries", error });
  }
};