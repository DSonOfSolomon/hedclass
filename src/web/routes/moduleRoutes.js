const express = require("express");
const router = express.Router();

const moduleController = require("../controllers/moduleController");
const authMiddleware = require("../middleware/authMiddleware");

/*
View modules
*/
router.get(
  "/modules",
  authMiddleware.isAuthenticated,
  moduleController.listModules
);

/*
Show create module form
*/
router.get(
  "/modules/create",
  authMiddleware.isAuthenticated,
  moduleController.showCreateModule
);

/*
Create module
*/
router.post(
  "/modules/create",
  authMiddleware.isAuthenticated,
  moduleController.createModule
);

/*
Show edit module form
*/
router.get(
  "/modules/edit/:id",
  authMiddleware.isAuthenticated,
  moduleController.showEditModule
);

/*
    Update module
    */
router.post(
  "/modules/update/:id",
  authMiddleware.isAuthenticated,
  moduleController.updateModule
);

/*
Delete module
*/
router.get(
  "/modules/delete/:id",
  authMiddleware.isAuthenticated,
  moduleController.deleteModule
);

module.exports = router;
