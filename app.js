const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// create express app and server early to avoid initialization-order issues
const app = express();
const server = http.createServer(app);

// ------------------- MIDDLEWARE -------------------

// CORS FIX (only apply once)
app.use(cors({
  origin: ["https://sangamwholesale.com", "http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploads directory — no-cache so browsers always get fresh images
app.use(express.static(path.join(__dirname, "uploads"), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-store");
  },
}));

// ------------------- ROUTES -------------------

// Admin Routes
app.use("/api/admin", require("./routes/Admin/adminRoutes"));
app.use("/api/categories", require("./routes/Admin/categoryRoutes"));
app.use("/api/subcategories", require("./routes/Admin/subcategoryRoutes"));
app.use("/api/products", require("./routes/Admin/productRoutes"));
app.use("/api/banners", require("./routes/Admin/bannerRoutes"));
app.use("/api/admin/business", require("./routes/Admin/businessRoutes"));

// User Routes
app.use("/api/user", require("./routes/User/userRoutes"));
app.use("/api/business", require("./routes/User/businessRoutes"));
app.use("/api/addresses", require("./routes/User/addressRoutes"));
app.use("/api/cart", require("./routes/User/myCartRoutes"));
app.use("/api/wishlist", require("./routes/User/wishListRoutes"));
app.use("/api/orders", require("./routes/User/orderRoutes"));
app.use("/api/return-orders", require("./routes/User/returnOrderRoutes"));
app.use("/api/payments", require("./routes/User/razorpayRoutes"));
app.use("/api/bank-accounts", require("./routes/User/bankAccountRoutes"));
app.use("/api/kyc", require("./routes/User/kycRoutes"));
app.use("/api/Founder", require("./routes/Admin/founderRoutes"));
app.use("/api/Team", require("./routes/Admin/teamRoutes"));
app.use("/api/trading", require("./routes/Admin/tradingRoutes"));


const { createInitialAdmin } = require("./controllers/Admin/adminController");


app.use(express.static(path.join(__dirname, 'build')));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});
const PORT = process.env.PORT || 1083;

const startServer = async () => {
  try {
    await connectDB(); // wait for DB before anything else
    server.listen(PORT, '0.0.0.0', async () => {
      console.log(`Server running on port ${PORT}`);
      try {
        await createInitialAdmin();
      } catch (err) {
        console.error('Error creating initial admin on startup:', err);
      }
    });
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  }
};

startServer();
