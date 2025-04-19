const express = require("express");
const router = express.Router();
const controller = require("../../controllers/User/deliveryprefController");
const { userProtect, adminProtect } = require("../../middleware/Middleware");
router.get("/", adminProtect, controller.getAllPreferences);
router.post("/", userProtect, controller.createPreference);
router.get("/:id", userProtect, controller.getPreferenceById);
router.put("/:id", userProtect, controller.updatePreference);
router.delete("/:id", userProtect, controller.deletePreference);

module.exports = router;
