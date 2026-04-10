// Import express router
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Import the authentication controller
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { isAuthenticated, isOfficer, isAdmin } = require("../middleware/authMiddleware");

router.get("/login", authController.showLogin);

router.post("/login", authController.login);

// Dashboard route
router.get(
  "/dashboard", isOfficer, authController.dashboard);

  router.get("/admin/dashboard", isAdmin, adminController.dashboard);

// Logout route
router.get("/logout", authController.logout);

module.exports = router;
