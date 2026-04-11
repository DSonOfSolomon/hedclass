
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { isAuthenticated, isOfficer, isAdmin } = require("../middleware/authMiddleware");

router.get("/login", authController.showLogin);

router.post("/login", authController.login);


router.get(
  "/dashboard", isOfficer, authController.dashboard);

  router.get("/admin/dashboard", isAdmin, adminController.dashboard);


router.get("/logout", authController.logout);

module.exports = router;
