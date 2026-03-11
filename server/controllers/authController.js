const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ===================== SIGNUP ===================== */
exports.signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const finalUsername = name || username;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username: finalUsername,
      email,
      password: hashedPassword,
      role: req.body.role || "student"
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ===================== LOGIN ===================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('cart');
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================== FORGOT PASSWORD ===================== */
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.forgotpassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "There is no user with that email" });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `http://localhost:5174/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message
      });

      res.status(200).json({ success: true, message: "Email sent" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================== RESET PASSWORD ===================== */
exports.resetpassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token or token expired" });
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate JWT (auto-login after reset, optional)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token,
      user
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================== GET PROFILE ===================== */
exports.getProfile = async (req, res) => {
  try {
    // The authMiddleware sets req.user.id based on the Bearer token (JWT in header) OR the cookie.
    // However, to ensure cross-tab isolation works properly when multiple tabs have different localStorages
    // but share the SAME browser cookie, the client now primarily sends the Bearer token.
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count courses based on role
    const Course = require("../models/Course");
    let courseCount = 0;
    if (user.role === 'admin') {
      courseCount = await Course.countDocuments({ instructor: user._id });
    } else {
      courseCount = await Course.countDocuments({ enrolledStudents: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      courseCount,
      watchedDaysCount: user.watchedDays ? user.watchedDays.length : 0
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================== TRACK WATCH PROGRESS ===================== */
exports.trackWatch = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get today's date string in YYYY-MM-DD format based on UTC
    const today = new Date().toISOString().split('T')[0];

    // Initialize array if it doesn't exist
    if (!user.watchedDays) {
      user.watchedDays = [];
    }

    // Only add if not already watched today
    if (!user.watchedDays.includes(today)) {
      user.watchedDays.push(today);
      await user.save();
    }

    res.status(200).json({
      success: true,
      watchedDaysCount: user.watchedDays.length
    });
  } catch (error) {
    console.error("TRACK WATCH ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================== SAVE CART ===================== */
exports.saveCart = async (req, res) => {
  try {
    const { cartIds } = req.body;

    if (!Array.isArray(cartIds)) {
      return res.status(400).json({ message: "cartIds must be an array" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = cartIds;
    await user.save();

    res.status(200).json({ success: true, message: "Cart saved to profile" });
  } catch (error) {
    console.error("SAVE CART ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};