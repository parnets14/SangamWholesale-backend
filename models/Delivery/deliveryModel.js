const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deliverySchema = new Schema(
  {
    name: {
      type: String,
    },
    mobile: {
      type: Number,
    },
    email: {
      type: String,
    },
   
    blockstatus: {
      type: Boolean,
      default: true
    },
    aadharFront: {
      type: String 
    },
    aadharBack: {
      type: String 
    },
    panImage: {
      type: String 
    },
    dlImage: {
      type: String 
    },
    driverId:{
        type: Number 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deliveryboy", deliverySchema);
