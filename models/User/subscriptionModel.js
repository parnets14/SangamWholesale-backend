// models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    frequency: {
      type: String,
      enum: ["daily", "custom", "interval"],
      required: true,
    },
    customDays: {
      type: [Number], // 0-6 for days of week (Sunday-Saturday)
      default: [],
    },
    intervalDays: {
      type: Number, // Interval in days
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextDeliveryDate: {
      type: Date,
      required: true,
    },
    deliverySlot: {
      start: String, // HH:MM format
      end: String,   // HH:MM format
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    isVacationMode: {
      type: Boolean,
      default: false,
    },
    vacationDetails: {
      startDate: Date,
      endDate: Date,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    // Store product details at time of subscription (for price protection)
    productSnapshot: {
      name: String,
      price: Number,
      size: String,
      unit: String,
      image: String,
    }
  },
  { timestamps: true }
);

// Method to check if delivery is due today
subscriptionSchema.methods.isDeliveryDueToday = function() {
  const today = new Date();
  const nextDelivery = new Date(this.nextDeliveryDate);
  
  return nextDelivery.getDate() === today.getDate() && 
         nextDelivery.getMonth() === today.getMonth() && 
         nextDelivery.getFullYear() === today.getFullYear();
};

// Method to calculate next delivery date based on frequency
subscriptionSchema.methods.calculateNextDeliveryDate = function() {
  const currentDate = new Date();
  let nextDate = new Date(this.nextDeliveryDate);
  
  if (this.frequency === "daily") {
    nextDate.setDate(nextDate.getDate() + 1);
  } 
  else if (this.frequency === "custom") {
    // Find the next custom day
    let daysChecked = 0;
    let found = false;
    
    while (!found && daysChecked < 7) {
      nextDate.setDate(nextDate.getDate() + 1);
      daysChecked++;
      
      if (this.customDays.includes(nextDate.getDay())) {
        found = true;
      }
    }
    
    if (!found) {
      // If no custom day found, default to 7 days later
      nextDate.setDate(currentDate.getDate() + 7);
    }
  } 
  else if (this.frequency === "interval") {
    nextDate.setDate(nextDate.getDate() + this.intervalDays);
  }
  
  return nextDate;
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;