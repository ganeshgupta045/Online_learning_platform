const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Course = require("../models/Course");

// Initialize Razorpay
// Note: Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_id",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret",
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount should be passed in INR from frontend

        // Create Razorpay order
        const options = {
            amount: amount * 100, // Razorpay takes amount in paise (1 INR = 100 paise)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ success: false, message: "Error creating order" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseIds, // Array of course IDs purchased
        } = req.body;

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret";

        // For Razorpay signature verification
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        // Optional: Bypass signature check if we are just mocking/testing without actual razorpay keys
        // In production, NEVER bypass this.
        const isMock = process.env.RAZORPAY_KEY_ID === "rzp_test_mock_id" || !process.env.RAZORPAY_KEY_ID;

        if (isAuthentic || isMock) {
            // Add purchased courses to the user's purchasedCourses array
            const user = await User.findById(req.user._id);

            courseIds.forEach(id => {
                if (!user.purchasedCourses.includes(id)) {
                    user.purchasedCourses.push(id);
                }
            });

            await user.save();

            // Also add user to the course's enrolledStudents array
            for (let courseId of courseIds) {
                const course = await Course.findById(courseId);
                if (course && !course.enrolledStudents.includes(req.user._id)) {
                    course.enrolledStudents.push(req.user._id);
                    await course.save();
                }
            }

            res.status(200).json({
                success: true,
                message: "Payment verified successfully and courses added",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        }
    } catch (error) {
        console.error("VERIFY PAYMENT ERROR:", error);
        res.status(500).json({ success: false, message: "Server error during verification" });
    }
};
