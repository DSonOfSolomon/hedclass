
const express = require("express");
const router = express.Router();


const degreeController = require("../controllers/degreeController");


const authMiddleware = require("../middleware/authMiddleware");


router.get(
  "/admin/degrees",
  authMiddleware.isAdmin,
  degreeController.listDegrees
);


router.get(
  "/admin/degrees/create",
  authMiddleware.isAdmin,
  degreeController.showCreateDegree
);


router.post(
  "/admin/degrees/create",
  authMiddleware.isAdmin,
  degreeController.createDegree
);


router.get(
  "/admin/degrees/delete/:id",
  authMiddleware.isAdmin,
  degreeController.deleteDegree
);

router.get(
  "/admin/degrees/edit/:id",
  authMiddleware.isAdmin,
  degreeController.showEditDegree
);

router.post(
  "/admin/degrees/edit/:id",
  authMiddleware.isAdmin,
  degreeController.updateDegree
);

module.exports = router;
