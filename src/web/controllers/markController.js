const db = require("../models/db");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getCheckboxValue, getInteger, getTrimmedString } = require("../utils/validation");

exports.listMarks = (req, res) => {
  const officerId = req.session.user.id;
  const degreeId = req.query.degree_id ? getInteger(req.query.degree_id, { min: 1 }) : null;
  const search = getTrimmedString(req.query.search, { maxLength: 100 });

  let sql = `
    SELECT 
      marks.*,
      students.name AS student_name,
      modules.name AS module_name,
      modules.credits,
      degrees.name AS degree_name
    FROM marks
    JOIN students ON marks.student_id = students.id
    JOIN modules ON marks.module_id = modules.id
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const params = [officerId];

  if (search) {
    sql += " AND (students.name LIKE ? OR modules.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (degreeId) {
    sql += " AND students.degree_id = ?";
    params.push(degreeId);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Mark list query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to load marks.");
    }

    res.render("marks", { marks: results, search });
  });
};

exports.showCreateMark = (req, res) => {
  const studentQuery = "SELECT * FROM students";
  const moduleQuery = "SELECT * FROM modules";

  db.query(studentQuery, (err, students) => {
    if (err) {
      console.error("Student list for mark create failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to load students.");
    }

    db.query(moduleQuery, (err, modules) => {
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

  const sql = `
    INSERT INTO marks (student_id, module_id, mark, is_resit)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [studentId, moduleId, mark, isResit ? 1 : 0], (err) => {
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

  const markQuery = "SELECT * FROM marks WHERE id = ?";
  const studentQuery = "SELECT * FROM students";
  const moduleQuery = "SELECT * FROM modules";

  db.query(markQuery, [id], (err, markResult) => {
    if (err) {
      console.error("Mark lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to load mark details.");
    }

    db.query(studentQuery, (err, students) => {
      if (err) {
        console.error("Student list for mark edit failed:", err.message);
        return renderErrorPage(res, 500, "Mark Error", "Unable to load students.");
      }

      db.query(moduleQuery, (err, modules) => {
        if (err) {
          console.error("Module list for mark edit failed:", err.message);
          return renderErrorPage(res, 500, "Mark Error", "Unable to load modules.");
        }

        if (!markResult || markResult.length === 0) {
          return renderErrorPage(res, 404, "Mark Not Found", "The requested mark could not be found.");
        }

        res.render("edit_mark", {
          mark: markResult[0],
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

  const sql = `
    UPDATE marks
    SET student_id = ?, module_id = ?, mark = ?, is_resit = ?
    WHERE id = ?
    `;

  db.query(sql, [studentId, moduleId, mark, isResit ? 1 : 0, id], (err) => {
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

  const sql = "DELETE FROM marks WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Delete mark query failed:", err.message);
      return renderErrorPage(res, 500, "Mark Error", "Unable to delete mark.");
    }

    redirectWithFlash(req, res, "/marks", "success", "Mark deleted.");
  });
};
