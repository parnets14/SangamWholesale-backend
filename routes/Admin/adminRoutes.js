const express = require("express");
const router = express.Router();

const {
  adminLogin,
  adminRegister,
} = require("../../controllers/Admin/adminController");

// private routes
router.post("/adminlogin", adminLogin);
router.post("/adminRegister", adminRegister);

module.exports = router;
