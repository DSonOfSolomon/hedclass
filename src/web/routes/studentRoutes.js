const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");


router.get(
  "/students",
  authMiddleware.isAuthenticated,
  studentController.listStudents
);


router.get(
  "/students/create",
  authMiddleware.isAuthenticated,
  studentController.showCreateStudent
);


router.post(
  "/students/create",
  authMiddleware.isAuthenticated,
  studentController.createStudent
);


router.get(
  "/students/edit/:id",
  authMiddleware.isAuthenticated,
  studentController.showEditStudent
);


router.post(
  "/students/update/:id",
  authMiddleware.isAuthenticated,
  studentController.updateStudent
);


router.get(
  "/students/delete/:id",
  authMiddleware.isAuthenticated,
  studentController.deleteStudent
);


router.get(
  "/students/classify/:id",
  authMiddleware.isAuthenticated,
  studentController.classifyStudent
);


router.get(
  "/students/override/:id",
  authMiddleware.isAuthenticated,
  studentController.showOverrideForm
  );
  

  router.post(
  "/students/override/:id",
  authMiddleware.isAuthenticated,
  studentController.saveOverride
  );

  router.get(
    "/programmes/:id",
    authMiddleware.isOfficer,
    studentController.showProgrammeDetails);
module.exports = router;
