const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// --- 1. Registration Route (POST) ---
router.post("/register", authController.register);

// --- 2. Login Route (POST) ---
router.post("/login", authController.login);

// --- 3. Forgot Password Route (POST) ---
router.post("/forgot-password", authController.forgotPassword);

// --- 4. رابط تحديث النقاط (لازم يكون فوق module.exports) ---
router.post("/update-score", authController.updateScore);

// --- 5. Admin Routes ---
router.get("/all-players", authController.getAllPlayers);
router.put("/update-player/:id", authController.updatePlayer);

// السطر هذا لازم يكون آخر شيء في الملف دائماً
module.exports = router;