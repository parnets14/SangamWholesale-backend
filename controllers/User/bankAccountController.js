const BankAccount = require("../../models/User/bankManageModel");

// Create new bank account
const createBankAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;

    // If this is the first account, set as default
    const count = await BankAccount.countDocuments({ userId });
    if (count === 0) data.isDefault = true;

    const account = new BankAccount({ ...data, userId });
    await account.save();
    res.status(201).json({ success: true, message: "Bank account created", account });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all bank accounts for user
const getBankAccounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const accounts = await BankAccount.find({ userId });
    res.status(200).json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update bank account
const updateBankAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const data = req.body;
    const account = await BankAccount.findOneAndUpdate({ _id: id, userId }, data, { new: true });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found" });
    res.status(200).json({ success: true, message: "Bank account updated", account });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const account = await BankAccount.findOneAndDelete({ _id: id, userId });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found" });
    res.status(200).json({ success: true, message: "Bank account deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Set default bank account
const setDefaultBankAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    // Unset previous default
    await BankAccount.updateMany({ userId }, { isDefault: false });
    // Set new default
    const account = await BankAccount.findOneAndUpdate(
      { _id: id, userId },
      { isDefault: true },
      { new: true }
    );
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found" });
    res.status(200).json({ success: true, message: "Default account updated", account });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createBankAccount,
  getBankAccounts,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
};
