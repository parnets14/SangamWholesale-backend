/**
 * Test FCM push notification to Udaan-APP (customer) devices.
 *
 * Usage:
 *   node utils/testPushCustomer.js                  -- send to ALL customers with a token
 *   node utils/testPushCustomer.js <phone>           -- send to one customer by phone
 *   node utils/testPushCustomer.js <rawFcmToken>     -- send to a raw token directly
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const User = require("../models/User/userModel");
  const { sendToToken, sendToMany, isReady } = require("./push");

  if (!isReady()) {
    console.error("FCM not initialized. Check FIREBASE_SERVICE_ACCOUNT in .env");
    process.exit(1);
  }

  const arg = process.argv[2];
  let tokens = [];
  let label = "";

  if (!arg) {
    const users = await User.find().select("fcmToken userDetails phone");
    const withToken = users.filter(u => u.fcmToken && u.fcmToken.length > 10);
    if (!withToken.length) {
      console.log("No customers with an FCM token found.");
      console.log("Open the Udaan-APP on the device and log in first to register a token.");
      process.exit(0);
    }
    tokens = withToken.map(u => u.fcmToken);
    label = `all ${withToken.length} customer(s)`;
    console.log("Targets:", withToken.map(u => `${u.userDetails?.fullName || "Unknown"} (${u.phone})`));
  } else if (/^\d{10}$/.test(arg)) {
    const user = await User.findOne({ phone: { $regex: new RegExp(arg + "$") } });
    if (!user || !user.fcmToken || user.fcmToken.length < 10) {
      console.error(`Customer with phone ${arg} not found or has no FCM token.`);
      process.exit(1);
    }
    tokens = [user.fcmToken];
    label = `${user.userDetails?.fullName || "Customer"} (${user.phone})`;
    console.log("Target:", label);
  } else {
    tokens = [arg];
    label = "raw token";
  }

  const payload = {
    title: "Order Update",
    body: "Your order is being processed. Tap to see the latest status.",
    data: {
      type: "info",
      orderId: "",
    },
  };

  console.log("\nSending:", JSON.stringify(payload, null, 2));

  if (tokens.length === 1) {
    await sendToToken(tokens[0], payload);
  } else {
    await sendToMany(tokens, payload);
  }

  console.log(`\nNotification sent to ${label}`);
  process.exit(0);
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
