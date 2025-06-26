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
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Body parser
app.use(express.json());
app.use(morgan("dev"));
// Basic route
app.get("/", (req, res) => {
  res.send(`Welcome to Udaan :( LocalHost ${process.env.PORT || 8080})`);
});

// Allow requests from your frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("New client connected, ID:", socket.id);

  socket.on("userConnected", (userId) => {
    socket.userId = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected`);
  });

  socket.on("orderStatusUpdate", (data) => {
    io.to(`user_${userId}`).emit("orderUpdate", {
      orderId: data.orderId,
      status: data.status,
      message: data.message,
    });
  });

  socket.on("deliveryStatusUpdate", (data) => {
    io.to(`user_${userId}`).emit("deliveryUpdate", {
      orderId: data.orderId,
      status: data.status,
      location: data.location,
    });
  });

  socket.on("subscriptionUpdate", (data) => {
    io.to(`user_${userId}`).emit("subscriptionStatus", {
      subscriptionId: data.subscriptionId,
      status: data.status,
      message: data.message,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected, ID:", socket.id);
    if (socket.userId) {
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
