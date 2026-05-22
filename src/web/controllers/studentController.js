const Degree = require("../models/degreeModel");
const Student = require("../models/studentModel");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { calculateClassification } = require("../utils/classification");
const { getClassification, getInteger, getTrimmedString } = require("../utils/validation");

exports.listStudents = (req, res) => {
  const filter = req.query.filter;
  const degreeId = req.query.degree_id ? getInteger(req.query.degree_id, { min: 1 }) : null;
  const officerId = req.session.user.id;
  const search = getTrimmedString(req.query.search, { maxLength: 100 });

  Student.findForOfficer({ officerId, degreeId, filter, search }, (err, students) => {
    if (err) {
      console.error("Student list query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to load students.");
    }

    Student.findAssignedDegrees(officerId, (err, degrees) => {
      if (err) {
        console.error("Student degree filter query failed:", err.message);
        return renderErrorPage(res, 500, "Student Error", "Unable to load programme filters.");
      }

      res.render("students", { students, degrees, search });
    });
  });
};

exports.showCreateStudent = (_req, res) => {
  Degree.findAll((err, degrees) => {
    if (err) {
      console.error("Student create page degree query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to load programme options.");
    }

    res.render("create_student", { degrees });
  });
};

exports.createStudent = (req, res) => {
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const studentNumber = getTrimmedString(req.body.student_number, { required: true, maxLength: 50 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!name || !studentNumber || !degreeId) {
    return redirectWithFlash(req, res, "/students/create", "error", "Valid student details are required.");
  }

  Student.create({ name, studentNumber, degreeId }, (err) => {
    if (err) {
      console.error("Create student query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to create student.");
    }

    redirectWithFlash(req, res, "/students", "success", "Student created.");
  });
};

exports.showEditStudent = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/students", "error", "Invalid student id.");
  }

  Student.findById(id, (err, student) => {
    if (err) {
      console.error("Student lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to load student details.");
    }

    if (!student) {
      return renderErrorPage(res, 404, "Student Not Found", "The requested student could not be found.");
    }

    Degree.findAll((err, degrees) => {
      if (err) {
        console.error("Degree lookup for student edit failed:", err.message);
        return renderErrorPage(res, 500, "Student Error", "Unable to load programme options.");
      }

      res.render("edit_student", {
        student,
        degrees,
      });
    });
  });
};

exports.updateStudent = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const studentNumber = getTrimmedString(req.body.student_number, { required: true, maxLength: 50 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!id || !name || !studentNumber || !degreeId) {
    return redirectWithFlash(req, res, `/students/edit/${req.params.id}`, "error", "Valid student details are required.");
  }

  Student.update({ id, name, studentNumber, degreeId }, (err) => {
    if (err) {
      console.error("Update student query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to update student.");
    }

    redirectWithFlash(req, res, "/students", "success", "Student updated.");
  });
};

exports.deleteStudent = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/students", "error", "Invalid student id.");
  }

  Student.deleteById(id, (err) => {
    if (err) {
      console.error("Delete student query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to delete student.");
    }

    redirectWithFlash(req, res, "/students", "success", "Student deleted.");
  });
};

exports.classifyStudent = (req, res) => {
  const studentId = getInteger(req.params.id, { min: 1 });

  if (!studentId) {
    return redirectWithFlash(req, res, "/students", "error", "Invalid student id.");
  }

  Student.findClassificationInputs(studentId, (err, results) => {
    if (err) {
      console.error("Classification lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Classification Error", "Unable to load marks for classification.");
    }

    if (!results || results.length === 0) {
      return redirectWithFlash(req, res, "/students", "error", "No marks found for that student.");
    }

    const outcome = calculateClassification(results);

    Student.saveClassification({ studentId, outcome }, (err) => {
      if (err) {
        console.error("Classification update query failed:", err.message);
        return renderErrorPage(res, 500, "Classification Error", "Unable to save classification results.");
      }

      redirectWithFlash(
        req,
        res,
        `/students#student-${studentId}`,
        "success",
        `Classification calculated: ${outcome.classification}.`
      );
    });
  });
};

exports.showOverrideForm = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/students", "error", "Invalid student id.");
  }

  Student.findById(id, (err, student) => {
    if (err) {
      console.error("Override form query failed:", err.message);
      return renderErrorPage(res, 500, "Override Error", "Unable to load the override form.");
    }

    if (!student) {
      return renderErrorPage(res, 404, "Student Not Found", "The requested student could not be found.");
    }

    res.render("override_student", { student });
  });
};

exports.saveOverride = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const overrideClassification = getClassification(req.body.override_classification);
  const overrideReason = getTrimmedString(req.body.override_reason, {
    required: true,
    maxLength: 1000,
  });

  if (!id || !overrideClassification || !overrideReason) {
    return redirectWithFlash(
      req,
      res,
      `/students/override/${req.params.id}`,
      "error",
      "A valid override classification and reason are required."
    );
  }

  Student.saveOverride({ id, overrideClassification, overrideReason }, (err) => {
    if (err) {
      console.error("Override update query failed:", err.message);
      return renderErrorPage(res, 500, "Override Error", "Unable to save the override.");
    }

    redirectWithFlash(req, res, "/students", "success", "Classification override saved.");
  });
};

exports.getStudents = (req, res) => {
  const filter = req.query.filter;

  Student.findAllWithDegree({ filter }, (err, students) => {
    if (err) {
      console.error("Student export query failed:", err.message);
      return renderErrorPage(res, 500, "Student Error", "Unable to load students.");
    }

    res.render("students", { students });
  });
};

exports.showProgrammeDetails = (req, res) => {
  const degreeId = getInteger(req.params.id, { min: 1 });
  const officerId = req.session.user.id;

  if (!degreeId) {
    return redirectWithFlash(req, res, "/dashboard", "error", "Invalid programme id.");
  }

  Student.findProgrammeSummary({ degreeId, officerId }, (err, summary) => {
    if (err) {
      console.error("Programme summary query failed:", err.message);
      return renderErrorPage(res, 500, "Programme Error", "Unable to load programme details.");
    }

    if (!summary) {
      return renderErrorPage(res, 404, "Programme Not Found", "Programme not found or access denied.");
    }

    res.render("programme_details", summary);
  });
};
