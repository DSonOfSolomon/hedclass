const db = require("../models/db");

exports.listMarks = (req, res) => {
  const officerId = req.session.user.id;
  const degreeId = req.query.degree_id;
  const search = req.query.search;

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
      console.error(err);
      return res.send("Database error");
    }

    res.render("marks", { marks: results, search });
  });
};

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
