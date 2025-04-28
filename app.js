const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const socketIO = require("socket.io");

const path = require("path");

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

// Basic route
app.get("/", (req, res) => {
  res.send(`Welcome to Hebbevu Fresh:( LocalHost ${process.env.PORT || 5000})`);
});

// Admin Routes
app.use("/api/admin", require("./routes/Admin/adminRoutes"));
app.use("/api/welcome", require("./routes/Admin/welcomeRoutes"));
app.use("/api/banner", require("./routes/Admin/bannerRoutes"));
app.use("/api/categories", require("./routes/Admin/categoryRoutes"));
app.use("/api/products", require("./routes/Admin/productRoutes"));
app.use("/api/cities", require("./routes/Admin/cityRoutes"));
app.use("/api/faqs", require("./routes/Admin/faqRoutes"));
app.use("/api/discover", require("./routes/Admin/discoverRoutes"));

// User Routes
app.use("/api/user", require("./routes/User/userRoute"));
app.use("/api/addresses", require("./routes/User/addressRoutes"));
app.use("/api/subscription", require("./routes/User/subscriptionRoutes"));
app.use("/api/buyonce", require("./routes/User/buyonceRoute"));
app.use("/api/cart", require("./routes/User/cartRoutes"));
app.use("/api/wallet", require("./routes/User/walletRoutes"));
app.use("/api/orders", require("./routes/User/orderRoutes"));
app.use("/api/deliverypref", require("./routes/User/deliveryprefRoutes"));
app.use("/api/vacations", require("./routes/User/vactionRoutes"));
app.use("/api/referrals", require("./routes/User/referralRoutes"));

// Delivery Routes
app.use("/api/delivery", require("./routes/Driver/driverRoute"));

app.use(express.static(path.join(__dirname, "uploads")));
// app.use(express.static("uploads"));

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("New client connected, ID:", socket.id);

  socket.on("userConnected", (userId) => {
    socket.userId = userId;
    socket.join(`user_${userId}`);
    console.log(`User ${userId} connected`);
  });

  socket.on("orderStatusUpdate", (data) => {
    io.to(`user_${data.userId}`).emit("orderUpdate", {
      orderId: data.orderId,
      status: data.status,
      message: data.message,
    });
  });

  socket.on("deliveryStatusUpdate", (data) => {
    io.to(`user_${data.userId}`).emit("deliveryUpdate", {
      orderId: data.orderId,
      status: data.status,
      location: data.location,
    });
  });

  socket.on("subscriptionUpdate", (data) => {
    io.to(`user_${data.userId}`).emit("subscriptionStatus", {
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
