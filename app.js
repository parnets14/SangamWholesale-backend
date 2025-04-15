const express = require("express");

const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

//Admin Routes
app.use("/api/admin", require("./routes/Admin/adminRoutes"));

app.use("/api/categories", require("./routes/Admin/categoryRoutes"));

// User Routes
app.use("/api/user", require("./routes/User/userRoute"));

app.use("/api/products", require("./routes/productRoutes"));

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
