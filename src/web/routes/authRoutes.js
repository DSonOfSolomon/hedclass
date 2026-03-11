// Import express router
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Import the authentication controller
const authController = require("../controllers/authController");

router.get("/login", authController.showLogin);
router.post("/login", authController.login);

// Dashboard route
router.get("/dashboard",authMiddleware.isAuthenticated, authController.dashboard);

// Logout route
router.get("/logout", authController.logout);

module.exports = router;