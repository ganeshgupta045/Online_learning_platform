const express = require("express");
const { signup, login, forgotpassword, resetpassword, getProfile, trackWatch, saveCart } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotpassword", forgotpassword);
router.put("/resetpassword/:resettoken", resetpassword);
router.get("/profile", authMiddleware, getProfile);
router.post("/track-watch", authMiddleware, trackWatch);
router.post("/cart", authMiddleware, saveCart);

module.exports = router;