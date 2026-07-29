const express = require("express");
const router = express.Router();
const teamController = require("../../controllers/Admin/teamController");
const { adminProtect } = require("../../middleware/authMiddleware");
const createUploader = require("../../middleware/multer");

const uploadTeamImage = createUploader("team");

router.post("/", adminProtect, uploadTeamImage.single("image"), teamController.createTeamMember);
router.get("/", teamController.getAllTeamMembers);
router.get("/:id", teamController.getTeamMember);
router.put("/:id", adminProtect, uploadTeamImage.single("image"), teamController.updateTeamMember);
router.delete("/:id", adminProtect, teamController.deleteTeamMember);

module.exports = router;
