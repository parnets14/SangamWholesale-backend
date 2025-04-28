// controllers/referralController.js
const User = require("../../models/User/userModel");
const ReferralTransaction = require("../../models/User/referralModel");

// Get referral details for a user
exports.getReferralDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "referralCode referralCount referralEarnings walletBalance"
    );

    const referrals = await User.find({ referredBy: req.user._id }).select(
      "name email createdAt"
    );

    const transactions = await ReferralTransaction.find({
      referrer: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...user._doc,
        referrals,
        transactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Process referral signup
exports.processReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;

    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid referral code" });
    }

    // Check if user already exists (for signup)
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create new user with referral info
    const user = await User.create({
      ...req.body,
      referredBy: referrer._id,
    });

    // Create referral transaction (pending until conditions met)
    await ReferralTransaction.create({
      referrer: referrer._id,
      referee: user._id,
      amount: 100, // Example amount
    });

    // Update referrer's count
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { referralCount: 1 },
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Credit referral earnings (admin only)
exports.creditReferralEarnings = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await ReferralTransaction.findById(transactionId);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (transaction.status === "credited") {
      return res
        .status(400)
        .json({ success: false, message: "Already credited" });
    }

    // Update transaction status
    transaction.status = "credited";
    await transaction.save();

    // Update referrer's wallet
    await User.findByIdAndUpdate(transaction.referrer, {
      $inc: {
        referralEarnings: transaction.amount,
        walletBalance: transaction.amount,
      },
    });

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
