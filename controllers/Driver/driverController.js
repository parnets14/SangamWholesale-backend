const Driver = require("../../models/Driver/driverModel");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Helper functions
const cleanupFiles = (files) => {
  if (files) {
    Object.values(files).forEach((file) => {
      if (file && file[0] && file[0].path) {
        fs.unlink(file[0].path, (err) => {
          if (err) console.error(`Error deleting file: ${file[0].path}`, err);
        });
      }
    });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (driverId) => {
  return jwt.sign(
    { id: driverId },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "30d" }
  );
};

// 1. Send OTP to phone
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log("phone", phone);
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    // Check if driver exists (for login) or is new (for registration)
    const existingDriver = await Driver.findOne({ phone });
    const isNewDriver = !existingDriver;

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    let driver;
    if (isNewDriver) {
      // Create new driver record for registration
      driver = await Driver.create({
        phone,
        otp,
        otpExpiry,
        name: "Pending Registration", // Temporary placeholder
        email: `${phone.replace(/\D/g, "")}@temp.pending`, // Temporary placeholder
      });
    } else {
      // Update existing driver for login
      existingDriver.otp = otp;
      existingDriver.otpExpiry = otpExpiry;
      await existingDriver.save();
      driver = existingDriver;
    }

    // In production: Implement actual SMS sending here
    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      isNewDriver,
      otpExpiry,
      otp,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
};

// 2. Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    let driver;

    if (phone) {
      // Find by phone number if ID not provided or not found
      driver = await Driver.findOne({ phone });
    } else {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        error: "OTP is required",
      });
    }

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    // Check OTP validity
    if (driver.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    if (driver.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
    }

    // Clear OTP fields
    driver.otp = undefined;
    driver.otpExpiry = undefined;

    // For new drivers, mark as OTP verified
    if (!driver.isVerified) {
      driver.isVerified = true;
    }

    await driver.save();

    // Generate JWT token
    const token = generateToken(driver._id);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      verifiedId: driver._id,
      token,
      profileComplete: driver.isProfileComplete,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
};

// Complete Registration with File Uploads
exports.completeRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, phone } = req.body;
    const files = req.files;
    console.log("req.body", req.body);
    // Validate required fields
    if (!name || !email || !phone) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Verified ID, name, email, and phone are required",
      });
    }

    // Validate files
    const requiredFiles = ["aadharFront", "aadharBack", "panImage", "dlImage"];
    const missingFiles = requiredFiles.filter((file) => !files[file]);
    if (missingFiles.length > 0) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: `Missing required documents: ${missingFiles.join(", ")}`,
      });
    }

    // Find driver in database
    const driver = await Driver.findById(phone).session(session);
    if (!driver) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    // Verify driver status
    if (!driver.isVerified) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Phone number not verified",
      });
    }

    // Check if email already exists
    const emailExists = await Driver.findOne({
      email,
    }).session(session);
    if (emailExists) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      });
    }

    // Check if phone already exists
    const phoneExists = await Driver.findOne({
      phone,
    }).session(session);
    if (phoneExists) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Phone number already in use",
      });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../../uploads/driver");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process file uploads and update driver document URLs
    const documentFields = {
      aadharFront: files.aadharFront[0],
      aadharBack: files.aadharBack[0],
      panImage: files.panImage[0],
      dlImage: files.dlImage[0],
    };

    for (const [field, file] of Object.entries(documentFields)) {
      // Generate unique filename
      const fileExt = path.extname(file.originalname);
      const filename = `${field}-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, filename);

      // Move file from temp location to permanent location
      fs.renameSync(file.path, filePath);

      // Update driver document URL
      driver[field] = `${req.protocol}://${req.get(
        "host"
      )}/uploads/driver/${filename}`;
    }

    // Update driver details
    driver.name = name;
    driver.email = email;
    driver.phone = phone;

    // Mark profile as complete
    driver.isProfileComplete = true;

    await driver.save({ session });
    await session.commitTransaction();

    // Prepare response data (excluding sensitive fields)
    const driverData = {
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      driverId: driver.driverId,
      isProfileComplete: driver.isProfileComplete,
      documents: {
        aadharFront: driver.aadharFront,
        aadharBack: driver.aadharBack,
        panImage: driver.panImage,
        dlImage: driver.dlImage,
      },
    };

    res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      driver: driverData,
    });
  } catch (error) {
    await session.abortTransaction();
    cleanupFiles(req.files);
    console.error("Error completing registration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete registration",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
};
// 4. Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { tempId } = req.body;

    if (!tempId) {
      return res.status(400).json({
        success: false,
        error: "Temp ID is required",
      });
    }

    const driver = await Driver.findById(tempId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    driver.otp = otp;
    driver.otpExpiry = otpExpiry;
    await driver.save();

    // In production: Implement actual SMS sending here
    console.log(`Resent OTP for ${driver.phone}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      tempId: driver._id,
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend OTP",
    });
  }
};

// 5. Get Driver Profile
exports.getProfile = async (req, res) => {
  try {
    const driverId = req.user.id; // From JWT

    const driver = await Driver.findById(driverId).select(
      "-otp -otpExpiry -__v"
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
};

// 6. Update Profile
exports.updateProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const driverId = req.user.id;
    const { name, email } = req.body;
    const files = req.files;

    const driver = await Driver.findById(driverId).session(session);
    if (!driver) {
      cleanupFiles(files);
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: "Driver not found",
      });
    }

    // Update basic info
    if (name) driver.name = name;

    if (email && email !== driver.email) {
      const emailExists = await Driver.findOne({
        email,
        _id: { $ne: driverId },
      }).session(session);
      if (emailExists) {
        cleanupFiles(files);
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: "Email already in use",
        });
      }
      driver.email = email;
    }

    // Handle file updates
    const deleteOldFile = async (field) => {
      if (driver[field]) {
        const filename = driver[field].split("/").pop();
        const filePath = path.join(__dirname, "../../uploads/driver", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    };

    if (files) {
      if (files.aadharFront) {
        await deleteOldFile("aadharFront");
        driver.aadharFront = `${req.protocol}://${req.get(
          "host"
        )}/uploads/driver/${files.aadharFront[0].filename}`;
      }
      if (files.aadharBack) {
        await deleteOldFile("aadharBack");
        driver.aadharBack = `${req.protocol}://${req.get(
          "host"
        )}/uploads/driver/${files.aadharBack[0].filename}`;
      }
      if (files.panImage) {
        await deleteOldFile("panImage");
        driver.panImage = `${req.protocol}://${req.get(
          "host"
        )}/uploads/driver/${files.panImage[0].filename}`;
      }
      if (files.dlImage) {
        await deleteOldFile("dlImage");
        driver.dlImage = `${req.protocol}://${req.get("host")}/uploads/driver/${
          files.dlImage[0].filename
        }`;
      }
    }

    // Re-check profile completion
    const requiredDocs = ["aadharFront", "aadharBack", "panImage", "dlImage"];
    const hasAllDocs = requiredDocs.every((doc) => driver[doc]);
    driver.isProfileComplete =
      !!driver.name && !!driver.email && !!driver.phone && hasAllDocs;

    await driver.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      driver: {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        isProfileComplete: driver.isProfileComplete,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    cleanupFiles(req.files);
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  } finally {
    session.endSession();
  }
};
