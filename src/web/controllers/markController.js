const db = require("../models/db");

/*
List all marks
*/
exports.listMarks = (req, res) => {
  const sql = `
    SELECT marks.*, 
students.name AS student_name, 
modules.name AS module_name,
modules.credits
FROM marks
LEFT JOIN students ON marks.student_id = students.id
LEFT JOIN modules ON marks.module_id = modules.id
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    res.render("marks", { marks: results });
  });
};

/*
Show mark entry form
*/
exports.showCreateMark = (req, res) => {
  const studentQuery = "SELECT * FROM students";
  const moduleQuery = "SELECT * FROM modules";

  db.query(studentQuery, (err, students) => {
    if (err) return res.send("Error loading students");

    db.query(moduleQuery, (err, modules) => {
      if (err) return res.send("Error loading modules");

      res.render("create_mark", { students, modules });
    });
  });
};

/*
Save mark
*/
exports.createMark = (req, res) => {
  const { student_id, module_id, mark, is_resit } = req.body;

  const sql = `
    INSERT INTO marks (student_id, module_id, mark, is_resit)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [student_id, module_id, mark, is_resit ? 1 : 0], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error saving mark");
    }

    res.redirect("/marks");
  });
};

/*
Show edit mark form
*/
exports.showEditMark = (req, res) => {
  const id = req.params.id;

  const markQuery = "SELECT * FROM marks WHERE id = ?";
  const studentQuery = "SELECT * FROM students";
  const moduleQuery = "SELECT * FROM modules";

  db.query(markQuery, [id], (err, markResult) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    db.query(studentQuery, (err, students) => {
      if (err) return res.send("Error loading students");

      db.query(moduleQuery, (err, modules) => {
        if (err) return res.send("Error loading modules");

        res.render("edit_mark", {
          mark: markResult[0],
          students,
          modules,
        });
      });
    });
  });
};

/*
Update mark
*/
exports.updateMark = (req, res) => {
  const id = req.params.id;

  const { student_id, module_id, mark, is_resit } = req.body;

  const sql = `
    UPDATE marks
    SET student_id = ?, module_id = ?, mark = ?, is_resit = ?
    WHERE id = ?
    `;

  db.query(sql, [student_id, module_id, mark, is_resit ? 1 : 0, id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error updating mark");
    }

    res.redirect("/marks");
  });
};

/*
Delete mark
*/
exports.deleteMark = (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM marks WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error deleting mark");
    }

    res.redirect("/marks");
  });
};
