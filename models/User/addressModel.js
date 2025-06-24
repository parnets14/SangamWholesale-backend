addressDetails: {
    shopName: { type: String },
    shopNumber: { type: String },
    areaName: { type: String },
    pincode: { type: String },
    city: { type: String },
    town: { type: String },
    deliveryContact: { type: String },
    saveAddress: { type: Boolean, default: false },
    default: { type: Boolean, default: true},
    shopOpenTime: { type: String },
    openClosedDays: {
      type: Map,
      of: String, // e.g., { sunday: "open", monday: "close", ... }
    },
    lunchTime: {
      lunchStart: { type: String },
      lunchEnd: { type: String },
    },
  },