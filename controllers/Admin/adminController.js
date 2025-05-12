const adminModel = require("../../models/Admin/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminRegister = async (req, res) => {
  const { adminName, adminEmail, adminPassword,role } = req.body;
  try {
    const isEmail = await adminModel.findOne({ adminEmail });
    if (isEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = new adminModel({
      adminName,
      adminEmail,
      role,
      adminPassword: hashedPassword,
    });

    await newAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Admin regisered successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const adminLogin = async (req, res) => {
  const { adminEmail, adminPassword } = req.body;
  try {
    const admin = await adminModel.findOne({ adminEmail });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Email not registered ",
      });
    }

    const isPasswordMatch = await bcrypt.compare(adminPassword, admin.adminPassword);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
      },
      process.env.JWT_secret
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

 module.exports ={ adminLogin, adminRegister };
