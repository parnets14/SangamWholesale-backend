const Address = require('../../models/User/addressModel');

// Create new address
const createAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;
    const address = new Address({ ...data, userId });
    await address.save();
    res.status(201).json({ success: true, message: 'Address created', address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all addresses for user
const getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.find({ userId });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const data = req.body;
    const address = await Address.findOneAndUpdate({ _id: id, userId }, data, { new: true });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.status(200).json({ success: true, message: 'Address updated', address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, userId });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
}; 