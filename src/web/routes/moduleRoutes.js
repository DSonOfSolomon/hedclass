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
Delete module
*/
router.get(
"/modules/delete/:id",
authMiddleware.isAuthenticated,
moduleController.deleteModule
);

module.exports = router;
