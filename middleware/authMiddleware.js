// const jwt = require("jsonwebtoken");
// const User = require("../middleware/authMiddleware");

// // Middleware to protect routes that require authentication
// const protect = async (req, res, next) => {
//   let token;

//   // Check if token exists in headers
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       // Get token from header
//       token = req.headers.authorization.split(" ")[1];

//       // Verify token
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET || "your_jwt_secret"
//       );

//       // Get user from the token (exclude sensitive fields)
//       req.user = await User.findById(decoded.id).select("-otp -otpExpiry");

//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: "User not found with this token",
//         });
//       }

//       next();
//     } catch (error) {
//       console.error("Auth middleware error:", error);
//       res.status(401).json({
//         success: false,
//         message: "Not authorized, token failed",
//       });
//     }
//   }

//   if (!token) {
//     res.status(401).json({
//       success: false,
//       message: "Not authorized, no token",
//     });
//   }
// };

// module.exports = { protect };





const jwt = require("jsonwebtoken");
const User = require("../models/User/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

      req.user = await User.findById(decoded.id).select("-otp -otpExpiry");
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;

