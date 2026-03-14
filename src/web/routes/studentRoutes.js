const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

/*
View all students
*/
router.get(
  "/students",
  authMiddleware.isAuthenticated,
  studentController.listStudents
);

/*
Show create student form
*/
router.get(
  "/students/create",
  authMiddleware.isAuthenticated,
  studentController.showCreateStudent
);

/*
Create student
*/
router.post(
  "/students/create",
  authMiddleware.isAuthenticated,
  studentController.createStudent
);

/*
Show edit student form
*/
router.get(
  "/students/edit/:id",
  authMiddleware.isAuthenticated,
  studentController.showEditStudent
);

/*
Update student
*/
router.post(
  "/students/update/:id",
  authMiddleware.isAuthenticated,
  studentController.updateStudent
);

/*
Delete student
*/
router.get(
  "/students/delete/:id",
  authMiddleware.isAuthenticated,
  studentController.deleteStudent
);

module.exports = router;
