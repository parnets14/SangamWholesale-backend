const adminModel = require("../../models/Admin/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "defaultsecret", {
    expiresIn: "30d",
  });
};

// REGISTER
const adminRegister = async (req, res) => {
  const { adminName, adminEmail, adminPassword, role } = req.body;
  try {
    const existingAdmin = await adminModel.findOne({ adminEmail });
    if (existingAdmin) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = new adminModel({
      adminName,
      adminEmail,
      adminPassword: hashedPassword,
      role,
    });

    await newAdmin.save();

    const token = generateToken(newAdmin._id);

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        adminToken: token,
        adminName: newAdmin.adminName,
        adminEmail: newAdmin.adminEmail,
        role: newAdmin.role,
        adminPassword: newAdmin.adminPassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN
const adminLogin = async (req, res) => {
  const { adminEmail, adminPassword } = req.body;
  try {
    const admin = await adminModel.findOne({ adminEmail });
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Email not registered" });

    const isPasswordValid = await bcrypt.compare(
      adminPassword,
      admin.adminPassword
    );
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",

      admin: {
        id: admin._id,
        adminToken: token,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
        role: admin.role,
        adminPassword: admin.adminPassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ADMIN BY ID
const getAdminById = async (req, res) => {
  try {
    const admin = await adminModel
      .findById(req.params.id)
      .select("-adminPassword");
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE ADMIN
const updateAdmin = async (req, res) => {
  try {
    let updates = req.body;

    if (updates.adminPassword) {
      updates.adminPassword = await bcrypt.hash(updates.adminPassword, 10);
    }

    const updatedAdmin = await adminModel
      .findByIdAndUpdate(req.params.id, updates, {
        new: true,
      })
      .select("-adminPassword");

    if (!updatedAdmin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE ADMIN
const deleteAdmin = async (req, res) => {
  try {
    const admin = await adminModel.findByIdAndDelete(req.params.id);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  adminRegister,
  adminLogin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
