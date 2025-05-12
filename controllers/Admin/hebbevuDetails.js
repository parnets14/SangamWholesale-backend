const Business = require('../../models/Admin/hebbevuDetails');

// Create Business
exports.createBusiness = async (req, res) => {
  try {
    const business = await Business.create(req.body);
    res.status(201).json({ success: true, data: business });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Businesses
exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json({ success: true, data: businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Business by ID
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Business
exports.updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Business
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.status(200).json({ success: true, message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
