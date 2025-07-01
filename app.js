const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Body parser
app.use(express.json());
app.use(morgan("dev"));
// Basic route
app.get("/", (req, res) => {
  res.send(`Welcome to Udaan :( LocalHost ${process.env.PORT || 8080})`);
});

// Allow requests from your frontend origin
app.use(cors())

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
app.use("/api/bank-accounts", require("./routes/User/bankAccountRoutes"));
app.use("/api/kyc", require("./routes/User/kycRoutes"));
// Serve static files from uploads directory
app.use(express.static(path.join(__dirname, "uploads")));



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
