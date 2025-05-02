const express = require("express");
const router = express.Router();
const {
  getDiscoverItems,
  getDiscoverItem,
  createDiscoverItem,
  updateDiscoverItem,
  deleteDiscoverItem,
  likeDiscoverItem,
} = require("../../controllers/Admin/discoverController");
const { adminProtect } = require("../../middleware/Middleware");

// Get all discover items and create a new one
router.route("/").get(getDiscoverItems).post(adminProtect, createDiscoverItem);

// Get, update, and delete a specific discover item
router
  .route("/:id")
  .get(getDiscoverItem)
  .put(adminProtect, updateDiscoverItem)
  .delete(adminProtect, deleteDiscoverItem);

// Like a discover item
router.route("/:id/like").post(likeDiscoverItem);

module.exports = router;
