// Import express
const express = require("express");
const router = express.Router();

// Import controller
const adminController = require("../controllers/adminController");

// Import middleware to protect routes
const authMiddleware = require("../middleware/authMiddleware");

/*
Route: View all classification officers
Only admins can access
*/
router.get(
  "/admin/officers",
  authMiddleware.isAdmin,
  adminController.listOfficers
);

/*
Route: Show form to create new officer
*/
router.get(
  "/admin/officers/create",
  authMiddleware.isAdmin,
  adminController.showCreateOfficer
);

/*
Route: Handle officer creation
*/
router.post(
  "/admin/officers/create",
  authMiddleware.isAdmin,
  adminController.createOfficer
);

/*
Route: Delete officer
*/
router.get(
  "/admin/officers/delete/:id",
  authMiddleware.isAdmin,
  adminController.deleteOfficer
);

/*
Show officer-degree assignment page
*/
router.get(
  "/admin/assign",
  authMiddleware.isAdmin,
  adminController.showAssignPage
);

/*
    Handle assignment submission
    */
router.post(
  "/admin/assign",
  authMiddleware.isAdmin,
  adminController.assignOfficer
);

module.exports = router;
