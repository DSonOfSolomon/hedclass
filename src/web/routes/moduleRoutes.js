const express = require("express");
const router = express.Router();

const moduleController = require("../controllers/moduleController");
const authMiddleware = require("../middleware/authMiddleware");


router.get(
  "/modules",
  authMiddleware.isAuthenticated,
  moduleController.listModules
);


router.get(
  "/modules/create",
  authMiddleware.isAuthenticated,
  moduleController.showCreateModule
);


router.post(
  "/modules/create",
  authMiddleware.isAuthenticated,
  moduleController.createModule
);


router.get(
  "/modules/edit/:id",
  authMiddleware.isAuthenticated,
  moduleController.showEditModule
);


router.post(
  "/modules/update/:id",
  authMiddleware.isAuthenticated,
  moduleController.updateModule
);


router.get(
  "/modules/delete/:id",
  authMiddleware.isAuthenticated,
  moduleController.deleteModule
);

module.exports = router;
