const jwt = require("jsonwebtoken");
const Driver = require("../../models/Delivery/driverModel");

/**
 * Protect delivery-partner routes.
 *
 * Verifies the JWT, ensures it was issued for a driver (role: 'driver'),
 * loads the driver, and attaches it as req.driver.
 */
const driverProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );

      if (decoded.role !== "driver") {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized as a driver" });
      }

      const driver = await Driver.findById(decoded.id).select(
        "-otp -otpExpiry"
      );
      if (!driver) {
        return res
          .status(401)
          .json({ success: false, message: "Driver not found" });
      }
      if (driver.blockstatus) {
        return res
          .status(403)
          .json({ success: false, message: "Your account is blocked" });
      }

      req.driver = driver;
      return next();
    } catch (error) {
      console.error("Driver auth error:", error);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  return res
    .status(401)
    .json({ success: false, message: "Not authorized, no token" });
};

module.exports = { driverProtect };
