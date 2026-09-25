/**
 * Test FCM push notification script.
 *
 * Usage:
 *   node utils/testPush.js                  ← sends to ALL drivers that have an FCM token
 *   node utils/testPush.js <phone>           ← sends to one driver by phone number
 *   node utils/testPush.js <fcmToken>        ← sends directly to a raw FCM token
 *
 * Run from the backend root:
 *   cd d:\Udaan\SangamWholesale-backend
 *   node utils/testPush.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  // ── 1. Connect to MongoDB ────────────────────────────────────────────────
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const Driver = require("../models/Delivery/driverModel");
  const { sendToToken, sendToMany, isReady } = require("./push");

  if (!isReady()) {
    console.error(
      "FCM not initialized. Check serviceAccountKey.json exists in the backend root."
    );
    process.exit(1);
  }

  const arg = process.argv[2]; // optional: phone number or raw FCM token

  // ── 2. Resolve target(s) ─────────────────────────────────────────────────
  let tokens = [];
  let label = "";

  if (!arg) {
    // Send to every driver that has a token.
    const drivers = await Driver.find({ fcmToken: { $ne: "" } }).select(
      "name phone fcmToken"
    );
    if (!drivers.length) {
      console.log(
        "No drivers with an FCM token found. Log in on the app first to register a token."
      );
      process.exit(0);
    }
    tokens = drivers.map((d) => d.fcmToken);
    label = `all ${drivers.length} driver(s): ${drivers.map((d) => d.name).join(", ")}`;
    console.log("Targets →", drivers.map((d) => `${d.name} (${d.phone})`));
  } else if (arg.startsWith("+") || /^\d{10}$/.test(arg)) {
    // Looks like a phone number.
    const phone = arg.replace(/\D/g, "");
    const driver = await Driver.findOne({
      phone: { $regex: new RegExp(phone + "$") },
    });
    if (!driver || !driver.fcmToken) {
      console.error(`Driver with phone ${arg} not found or has no FCM token.`);
      process.exit(1);
    }
    tokens = [driver.fcmToken];
    label = `${driver.name} (${driver.phone})`;
    console.log("Target →", label);
  } else {
    // Treat as a raw FCM token.
    tokens = [arg];
    label = "raw token";
    console.log("Target → raw FCM token");
  }

  // ── 3. Send test notification ─────────────────────────────────────────────
  const payload = {
    title: "Test Notification",
    body: "Push notifications are working correctly. Tap this notification to open the Order List.",
    data: {
      type: "test",
      orderId: "000000000000000000000001",
    },
  };

  console.log("\nSending payload:", JSON.stringify(payload, null, 2));

  if (tokens.length === 1) {
    await sendToToken(tokens[0], payload);
  } else {
    await sendToMany(tokens, payload);
  }

  console.log(`\n✅ Notification sent to ${label}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
