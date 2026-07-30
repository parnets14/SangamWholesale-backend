const adminModel = require("../../models/Admin/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create initial admin
const createInitialAdmin = async () => {
  try {
    const existingAdmin = await adminModel.findOne({
      adminEmail: "sangamwholesale@gmail.com",
    });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("sangamwholesale@123", 10);
      await adminModel.create({
        adminName: "sangamwholesale",
        adminEmail: "sangamwholesale@gmail.com",
        adminPassword: hashedPassword,
        role: "admin",
      });
      console.log("Initial admin created successfully");
    }
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { adminEmail, adminPassword } = req.body;
    console.log("Login request received:", req.body); // Add this line
    const admin = await adminModel.findOne({ adminEmail });
    console.log("Found admin:", admin); // Add this line
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      adminPassword,
      admin.adminPassword
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    admin.token = token;
    await admin.save();

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.adminName,
        email: admin.adminEmail,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await adminModel
      .findById(req.admin.id)
      .select("-adminPassword -token");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createInitialAdmin,
  adminLogin,
  getAdminProfile,
};
