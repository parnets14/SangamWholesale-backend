const jwt = require("jsonwebtoken");
// const User = require("../models/User/userModel");
const Admin = require("../models/Admin/adminModel");

//userMiddleware
// const userProtect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET || "your_jwt_secret"
//       );

//       req.user = await User.findById(decoded.id).select("-otp -otpExpiry");
//       next();
//     } catch (error) {
//       console.error("Auth error:", error);
//       res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   } else {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// adminMiddleware
const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) {
        return res
          .status(401)
          .json({ message: "Admin not found, unauthorized" });
      }

      req.user = admin; // Attach admin to req.user
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { adminProtect };
