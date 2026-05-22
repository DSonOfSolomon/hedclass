const db = require("./db");

exports.findAll = (callback) => {
  db.query("SELECT * FROM marks", callback);
};

exports.findForOfficer = ({ officerId, degreeId, search }, callback) => {
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

  db.query(sql, params, callback);
};

exports.findById = (id, callback) => {
  db.query("SELECT * FROM marks WHERE id = ?", [id], (err, results) => {
    callback(err, results?.[0] || null);
  });
};

exports.create = ({ studentId, moduleId, mark, isResit }, callback) => {
  const sql = `
    INSERT INTO marks (student_id, module_id, mark, is_resit)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [studentId, moduleId, mark, isResit ? 1 : 0], callback);
};

exports.update = ({ id, studentId, moduleId, mark, isResit }, callback) => {
  const sql = `
    UPDATE marks
    SET student_id = ?, module_id = ?, mark = ?, is_resit = ?
    WHERE id = ?
  `;

  db.query(sql, [studentId, moduleId, mark, isResit ? 1 : 0, id], callback);
};

exports.deleteById = (id, callback) => {
  db.query("DELETE FROM marks WHERE id = ?", [id], callback);
};
