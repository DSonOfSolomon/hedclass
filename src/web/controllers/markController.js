const Mark = require("../models/markModel");
const Module = require("../models/moduleModel");
const Student = require("../models/studentModel");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getCheckboxValue, getInteger, getTrimmedString } = require("../utils/validation");

exports.listMarks = (req, res) => {
  const officerId = req.session.user.id;
  const degreeId = req.query.degree_id ? getInteger(req.query.degree_id, { min: 1 }) : null;
  const search = getTrimmedString(req.query.search, { maxLength: 100 });

  Mark.findForOfficer({ officerId, degreeId, search }, (err, marks) => {
    if (err) {
      console.error("Mark list query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to load marks.");
    }

    res.render("marks", { marks, search });
  });
};

exports.showCreateMark = (_req, res) => {
  Student.findAll((err, students) => {
    if (err) {
      console.error("Student list for mark create failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to load students.");
    }

    Module.findAll((err, modules) => {
      if (err) {
        console.error("Module list for mark create failed:", err.message);
        return renderErrorPage(res, 500, "Mark Error", "Unable to load modules.");
      }

      res.render("create_mark", { students, modules });
    });
  });
};

exports.createMark = (req, res) => {
  const studentId = getInteger(req.body.student_id, { min: 1 });
  const moduleId = getInteger(req.body.module_id, { min: 1 });
  const mark = getInteger(req.body.mark, { min: 0, max: 100 });
  const isResit = getCheckboxValue(req.body.is_resit);

  if (!studentId || !moduleId || mark === null) {
    return redirectWithFlash(req, res, "/marks/create", "error", "Valid mark details are required.");
  }

  Mark.create({ studentId, moduleId, mark, isResit }, (err) => {
    if (err) {
      console.error("Create mark query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to save mark.");
    }

    redirectWithFlash(req, res, "/marks", "success", "Mark created.");
  });
};

exports.showEditMark = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/marks", "error", "Invalid mark id.");
  }

  Mark.findById(id, (err, mark) => {
    if (err) {
      console.error("Mark lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to load mark details.");
    }

    if (!mark) {
      return renderErrorPage(res, 404, "Mark Not Found", "The requested mark could not be found.");
    }

    Student.findAll((err, students) => {
      if (err) {
        console.error("Student list for mark edit failed:", err.message);
        return renderErrorPage(res, 500, "Mark Error", "Unable to load students.");
      }

      Module.findAll((err, modules) => {
        if (err) {
          console.error("Module list for mark edit failed:", err.message);
          return renderErrorPage(res, 500, "Mark Error", "Unable to load modules.");
        }

        res.render("edit_mark", {
          mark,
          students,
          modules,
        });
      });
    });
  });
};

exports.updateMark = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const studentId = getInteger(req.body.student_id, { min: 1 });
  const moduleId = getInteger(req.body.module_id, { min: 1 });
  const mark = getInteger(req.body.mark, { min: 0, max: 100 });
  const isResit = getCheckboxValue(req.body.is_resit);

  if (!id || !studentId || !moduleId || mark === null) {
    return redirectWithFlash(req, res, `/marks/edit/${req.params.id}`, "error", "Valid mark details are required.");
  }

  Mark.update({ id, studentId, moduleId, mark, isResit }, (err) => {
    if (err) {
      console.error("Update mark query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to update mark.");
    }

    redirectWithFlash(req, res, "/marks", "success", "Mark updated.");
  });
};

exports.deleteMark = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/marks", "error", "Invalid mark id.");
  }

  Mark.deleteById(id, (err) => {
    if (err) {
      console.error("Delete mark query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to delete mark.");
    }

    redirectWithFlash(req, res, "/marks", "success", "Mark deleted.");
  });
};
