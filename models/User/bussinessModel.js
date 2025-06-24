business: {
    isCompleted: {
      type: Boolean,
      default: false,
    },
    businessName: {
      type: String,
    },
    businessType: {
      type: String,
    },
    category: {
      type: String,
    },
    frontImage: {
      type: String,
    },
    backImage: {
      type: String,
    },
    establishmentYear: {
      type: Number,
    },
    description: {
      type: String,
    },
    panAndGst: {
      panImage: { type: String },
      gstImage: { type: String },
      fssaiId: { type: String },
      taxCertificate: { type: String },
    },
    vacation: {
      startDate: { type: Date },
      endDate: { type: Date },
      vacationEnabled: { type: Boolean, default: false },
    },
    weeklyOff: {
      type: String, // "everyday" or "sat-sunday"
    },
    
  },