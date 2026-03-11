const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Create Order (Requires user to be logged in)
router.post("/create-order", authMiddleware, paymentController.createOrder);

// Verify Payment
router.post("/verify", authMiddleware, paymentController.verifyPayment);

module.exports = router;
