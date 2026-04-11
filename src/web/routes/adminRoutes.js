
const express = require("express");
const router = express.Router();


const adminController = require("../controllers/adminController");


const authMiddleware = require("../middleware/authMiddleware");


router.get(
  "/admin/officers",
  authMiddleware.isAdmin,
  adminController.listOfficers
);


router.get(
  "/admin/officers/create",
  authMiddleware.isAdmin,
  adminController.showCreateOfficer
);


router.post(
  "/admin/officers/create",
  authMiddleware.isAdmin,
  adminController.createOfficer
);


router.get(
  "/admin/officers/delete/:id",
  authMiddleware.isAdmin,
  adminController.deleteOfficer
);


router.get(
  "/admin/assign",
  authMiddleware.isAdmin,
  adminController.showAssignPage
);


router.post(
  "/admin/assign",
  authMiddleware.isAdmin,
  adminController.assignOfficer
);

router.get(
  "/admin/dashboard",
  authMiddleware.isAdmin,
  adminController.dashboard
);

router.get(
  "/admin/officers/edit/:id",
  authMiddleware.isAdmin,
  adminController.showEditOfficer
);

router.post(
  "/admin/officers/edit/:id",
  authMiddleware.isAdmin,
  adminController.updateOfficer
);

router.get(
  "/admin/assignments",
  authMiddleware.isAdmin,
  adminController.listAssignments
);

router.get(
  "/admin/unassign/:id",
  authMiddleware.isAdmin,
  adminController.unassignOfficer
);

module.exports = router;
