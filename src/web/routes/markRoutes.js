const express = require("express");
const router = express.Router();

const markController = require("../controllers/markController");
const authMiddleware = require("../middleware/authMiddleware");

/*
View marks
*/
router.get(
"/marks",
authMiddleware.isAuthenticated,
markController.listMarks
);

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

module.exports = router;
