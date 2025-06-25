const express = require("express");
const router = express.Router();
const {
  createBankAccount,
  getBankAccounts,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
} = require("../../controllers/User/bankAccountController");
const { userProtect } = require("../../middleware/authMiddleware");

// Create bank account
router.post("/", userProtect, createBankAccount);
// Get all bank accounts
router.get("/", userProtect, getBankAccounts);
// Update bank account
router.put("/:id", userProtect, updateBankAccount);
// Delete bank account
router.delete("/:id", userProtect, deleteBankAccount);
// Set default bank account
router.put("/:id/default", userProtect, setDefaultBankAccount);

module.exports = router;
