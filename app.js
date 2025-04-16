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
app.use("/api/products", require("./routes/Admin/productRoutes"));
app.use("/api/cities", require("./routes/Admin/cityRoutes"));

// User Routes
app.use("/api/user", require("./routes/User/userRoute"));

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
