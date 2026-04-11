const express = require("express");
const router = express.Router();

const markController = require("../controllers/markController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/marks", authMiddleware.isAuthenticated, markController.listMarks);


router.get(
  "/marks/create",
  authMiddleware.isAuthenticated,
  markController.showCreateMark
);


router.post(
  "/marks/create",
  authMiddleware.isAuthenticated,
  markController.createMark
);


router.get(
  "/marks/edit/:id",
  authMiddleware.isAuthenticated,
  markController.showEditMark
);


router.post(
  "/marks/update/:id",
  authMiddleware.isAuthenticated,
  markController.updateMark
);


router.get(
  "/marks/delete/:id",
  authMiddleware.isAuthenticated,
  markController.deleteMark
);

module.exports = router;
