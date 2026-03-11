// Import express
const express = require("express");
const router = express.Router();

// Import controller
const degreeController = require("../controllers/degreeController");

// Import admin protection middleware
const authMiddleware = require("../middleware/authMiddleware");

/*
View all degrees
*/
router.get(
  "/admin/degrees",
  authMiddleware.isAdmin,
  degreeController.listDegrees
);

/*
Show form to create degree
*/
router.get(
  "/admin/degrees/create",
  authMiddleware.isAdmin,
  degreeController.showCreateDegree
);

/*
Handle degree creation
*/
router.post(
  "/admin/degrees/create",
  authMiddleware.isAdmin,
  degreeController.createDegree
);

/*
Delete degree
*/
router.get(
  "/admin/degrees/delete/:id",
  authMiddleware.isAdmin,
  degreeController.deleteDegree
);

module.exports = router;
