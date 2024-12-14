require("dotenv").config(); // For environment variables
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // For parsing application/json data

// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/password_reset"; // Default MongoDB URI

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit on MongoDB connection error
  });

// User Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
});
const User = mongoose.model("User", UserSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to my deployed server on Render!");
});

// Register User
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create new user with hashed password
    const user = new User({ email, password: hashedPassword });
    await user.save();  // Save the user to the database

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error in register:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password with hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isPasswordCorrect);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Error in login:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Password Reset Flow: Request Password Reset
app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 12); // Random token
    console.log("Generated Reset Token:", resetToken);

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1-hour expiration

    // Save the updated user
    await user.save();
    console.log("User after saving token:", user);

    // Simulate sending email (You would use an email service like SendGrid here)
    console.log(`Password reset link: http://localhost:${PORT}/auth/reset-password/${resetToken}`);
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Error in forgot-password:", err.message);
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

app.post("/auth/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  console.log("Reset password request received");
  console.log("Token received:", token);
  console.log("New Password received:", newPassword);

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }, // Token should not be expired
    });

    if (!user) {
      console.log("Invalid or expired token");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("New hashed password:", hashedPassword);

    // Update user's password and clear reset details
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    // Save updated user
    await user.save();
    console.log("Password successfully reset for user:", user.email);

    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    console.error("Error in reset-password:", err.message);
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});