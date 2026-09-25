/**
 * Firebase Cloud Messaging sender (backend) — firebase-admin v13 API.
 *
 * Initializes firebase-admin from a service-account key and sends push
 * notifications to delivery partners. If the service-account key is not present,
 * this module becomes a safe no-op so the server still runs.
 *
 * Setup:
 *   Firebase console -> Project settings -> Service accounts ->
 *   "Generate new private key" -> save as:
 *     SangamWholesale-backend/serviceAccountKey.json
 *   (or set FIREBASE_SERVICE_ACCOUNT to its absolute path in .env)
 */
const path = require("path");
const fs = require("fs");

let messaging = null;
let ready = false;

try {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT
    ? path.resolve(__dirname, "..", process.env.FIREBASE_SERVICE_ACCOUNT)
    : path.join(__dirname, "..", "serviceAccountKey.json");

  if (fs.existsSync(keyPath)) {
    const admin = require("firebase-admin");
    const serviceAccount = require(keyPath);

    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    messaging = admin.messaging();
    ready = true;
    console.log("FCM push initialized");
  } else {
    console.log(
      "FCM push disabled — serviceAccountKey.json not found. Push will no-op."
    );
  }
} catch (e) {
  console.error("FCM init error (push disabled):", e.message);
}

/**
 * Send a push notification to one device token.
 * Safe no-op if FCM isn't configured or the token is missing.
 */
async function sendToToken(fcmToken, { title, body, data = {} }) {
  if (!ready || !fcmToken) {
    console.warn("FCM send skipped — ready:", ready, "token:", !!fcmToken);
    return;
  }
  try {
    const stringData = Object.fromEntries(
      Object.entries({ title, body, ...data }).map(([k, v]) => [k, String(v)])
    );
    const result = await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data: stringData,
      android: {
        priority: "high",
        ttl: 3600 * 1000, // 1 hour
        notification: {
          channelId: "orders",
          defaultSound: true,
          notificationPriority: "PRIORITY_HIGH",
          notificationCount: 1,
          visibility: "PUBLIC",
          defaultVibrateTimings: true,
        },
      },
    });
    console.log("FCM send success:", result);
  } catch (e) {
    console.error("FCM send failed:", e.code, e.message);
    // If token is invalid, log it clearly
    if (e.code === "messaging/registration-token-not-registered" ||
        e.code === "messaging/invalid-registration-token") {
      console.error("FCM token is invalid/expired. User needs to reopen the app to refresh token.");
    }
  }
}

/**
 * Send the same notification to many tokens (broadcast to all active partners).
 */
async function sendToMany(tokens, payload) {
  const unique = [...new Set((tokens || []).filter(Boolean))];
  await Promise.all(unique.map((t) => sendToToken(t, payload)));
}

module.exports = { sendToToken, sendToMany, isReady: () => ready };
