const express = require('express');
const router = express.Router();
const {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require('../../controllers/User/addressController');
const { userProtect } = require('../../middleware/authMiddleware');

// Create address
router.post('/', userProtect, createAddress);
// Get all addresses
router.get('/', userProtect, getAddresses);
// Update address
router.put('/:id', userProtect, updateAddress);
// Delete address
router.delete('/:id', userProtect, deleteAddress);

module.exports = router; 