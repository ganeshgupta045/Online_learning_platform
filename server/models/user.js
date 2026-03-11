const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },

    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],

    watchedDays: [
      {
        type: String // We will store dates in "YYYY-MM-DD" format
      }
    ],

    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

// Method to generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);