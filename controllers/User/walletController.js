const Wallet = require("../../models/User/walletModel");
const mongoose = require("mongoose");
// Get wallet balance
const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).populate(
      "transactions.order"
    );
    console.log("wallet", wallet);
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add money to wallet
const addToWallet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amount } = req.body;
    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Amount must be positive" });
    }

    let wallet = await Wallet.findOne({ user: req.user._id }).session(session);

    if (!wallet) {
      wallet = new Wallet({
        user: req.user._id,
        balance: amount,
        transactions: [
          {
            amount,
            type: "credit",
          },
        ],
      });
    } else {
      wallet.balance += amount;
      wallet.transactions.push({
        amount,
        type: "credit",
      });
    }

    await wallet.save({ session });
    await session.commitTransaction();
    res.status(200).json(wallet);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getWallet,
  addToWallet,
};
