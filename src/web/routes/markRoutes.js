const express = require("express");
const router = express.Router();

const markController = require("../controllers/markController");
const authMiddleware = require("../middleware/authMiddleware");

/*
View marks
*/
router.get("/marks", authMiddleware.isAuthenticated, markController.listMarks);

/*
Show mark entry form
*/
router.get(
  "/marks/create",
  authMiddleware.isAuthenticated,
  markController.showCreateMark
);

/*
Save mark
*/
router.post(
  "/marks/create",
  authMiddleware.isAuthenticated,
  markController.createMark
);

/*
Show edit mark form
*/
router.get(
  "/marks/edit/:id",
  authMiddleware.isAuthenticated,
  markController.showEditMark
);

/*
    Update mark
    */
router.post(
  "/marks/update/:id",
  authMiddleware.isAuthenticated,
  markController.updateMark
);

/*
Delete mark
*/
router.get(
  "/marks/delete/:id",
  authMiddleware.isAuthenticated,
  markController.deleteMark
);

module.exports = router;
