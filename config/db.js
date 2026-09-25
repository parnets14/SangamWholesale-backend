const mongoose = require("mongoose");

/**
 * Connect to MongoDB.
 *
 * Prefers the direct (non-SRV) connection string when available, because some
 * networks refuse the SRV DNS lookup that `mongodb+srv://` requires
 * (the "querySrv EREFUSED" error). Falls back to the SRV URI otherwise.
 * Retries a few times before giving up so a transient DNS/network blip
 * doesn't crash the whole server on startup.
 */
const connectDB = async (retries = 5) => {
  const uri = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`
      );
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 3000));
      } else {
        console.error("All MongoDB connection attempts failed.");
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
