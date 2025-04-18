const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Admin/deliveryprefController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");
router.get("/", controller.getAllPreferences);
router.post("/", adminProtect, controller.createPreference);
router.get("/:id", adminProtect, controller.getPreferenceById);
router.put("/:id", adminProtect, controller.updatePreference);
router.delete("/:id", adminProtect, controller.deletePreference);

module.exports = router;
