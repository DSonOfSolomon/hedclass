
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { isAuthenticated, isOfficer, isAdmin } = require("../middleware/authMiddleware");
const exportController = require("../controllers/exportController");

router.get("/login", authController.showLogin);

router.post("/login", authController.login);

router.get("/export", isOfficer, exportController.exportCSV);


router.get(
  "/dashboard", isOfficer, authController.dashboard);

  router.get("/admin/dashboard", isAdmin, adminController.dashboard);


router.get("/logout", authController.logout);

module.exports = router;
