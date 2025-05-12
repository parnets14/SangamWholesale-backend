const express = require('express');
const router = express.Router();
const businessController = require('../../controllers/Admin/hebbevuDetails');

// Create
router.post('/createBuissness', businessController.createBusiness);

// Read
router.get('/getBuissness', businessController.getBusinesses);
router.get('/getBuissness/:id', businessController.getBusinessById);

// Update
router.put('/updateBuissness/:id', businessController.updateBusiness);

// Delete
router.delete('/deleteBuissness/:id', businessController.deleteBusiness);

module.exports = router;
