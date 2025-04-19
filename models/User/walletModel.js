
const mongoose = require("mongoose");;

const walletSchema = new mongoose.Schema({
     user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
       },
       balance: {
      type: Number,
      required: true,
      default: 0  
    },
    transactions: [
      {
        transactionId: {
          type: String,
          required: true,
          unique: true 
        },
        date: {
          type: Date,
          default: Date.now  
        },
        detail: {
          type: String,
          required: true 
        },
        credit: {
          type: Number,
          default: 0  
        },
        debit: {
          type: Number,
          default: 0  
        },
      }
    ] 
},{ timestamps: true }  
)

const Wallet = mongoose.model("Wallet",walletSchema);
module.exports = Wallet ;