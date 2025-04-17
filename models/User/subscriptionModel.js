const mongoose = require("mongoose");

const subscriptionItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  discount: {
    type: Number,
    default: 0,
  },
});

const deliveryScheduleSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ["daily", "custom", "interval"],
    required: true,
  },
  intervalDays: {
    type: Number,
    min: 1,
    required: function () {
      return this.frequency === "interval";
    },
  },
  customDays: {
    type: [String],
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: function () {
      return this.frequency === "custom";
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  deliverySlot: {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
});

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [subscriptionItemSchema],
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    schedule: deliveryScheduleSchema,
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "completed"],
      default: "active",
    },
    nextDeliveryDate: {
      type: Date,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate totals
subscriptionSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemDiscounts = this.items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );

  this.discountTotal = itemDiscounts;
  this.grandTotal = this.subtotal - this.discountTotal + this.deliveryFee;

  // Calculate next delivery date if active
  if (this.status === "active") {
    this.calculateNextDelivery();
  }

  next();
});

// Method to calculate next delivery date
subscriptionSchema.methods.calculateNextDelivery = function () {
  if (!this.schedule.startDate) return;

  const now = new Date();
  const startDate = new Date(this.schedule.startDate);

  if (this.schedule.frequency === "daily") {
    if (now > startDate) {
      const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      this.nextDeliveryDate = new Date(startDate);
      this.nextDeliveryDate.setDate(startDate.getDate() + daysDiff + 1);
    } else {
      this.nextDeliveryDate = startDate;
    }
  } else if (this.schedule.frequency === "interval") {
    const interval = this.schedule.intervalDays || 1;
    if (now > startDate) {
      const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      const intervalsPassed = Math.floor(daysDiff / interval);
      this.nextDeliveryDate = new Date(startDate);
      this.nextDeliveryDate.setDate(
        startDate.getDate() + (intervalsPassed + 1) * interval
      );
    } else {
      this.nextDeliveryDate = startDate;
    }
  } else if (this.schedule.frequency === "custom") {
    // For custom days, find the next matching day after today
    const today = now.getDay();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const customDays = this.schedule.customDays.map((day) =>
      dayNames.indexOf(day)
    );

    let daysToAdd = 0;
    let found = false;

    for (let i = 0; i < 7; i++) {
      const checkDay = (today + i) % 7;
      if (customDays.includes(checkDay)) {
        daysToAdd = i;
        found = true;
        break;
      }
    }

    if (found) {
      this.nextDeliveryDate = new Date(now);
      this.nextDeliveryDate.setDate(now.getDate() + daysToAdd);
      this.nextDeliveryDate.setHours(0, 0, 0, 0);
    }
  }
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
