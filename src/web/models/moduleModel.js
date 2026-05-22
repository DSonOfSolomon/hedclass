const db = require("./db");

exports.findAll = (callback) => {
  db.query("SELECT * FROM modules", callback);
};

exports.findForOfficer = ({ officerId, degreeId, search }, callback) => {
  let sql = `
    SELECT modules.*, degrees.name AS degree_name
    FROM modules
    JOIN degrees ON modules.degree_id = degrees.id
    JOIN officer_degrees ON modules.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const params = [officerId];

  if (degreeId) {
    sql += " AND modules.degree_id = ?";
    params.push(degreeId);
  }

  if (search) {
    sql += " AND modules.name LIKE ?";
    params.push(`%${search}%`);
  }

  db.query(sql, params, callback);
};

exports.findById = (id, callback) => {
  db.query("SELECT * FROM modules WHERE id = ?", [id], (err, results) => {
    callback(err, results?.[0] || null);
  });
};

exports.create = ({ name, credits, year, degreeId }, callback) => {
  const sql = `
    INSERT INTO modules (name, credits, year, degree_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, credits, year, degreeId], callback);
};

exports.update = ({ id, name, credits, year, degreeId }, callback) => {
  const sql = `
    UPDATE modules
    SET name = ?, credits = ?, year = ?, degree_id = ?
    WHERE id = ?
  `;

  db.query(sql, [name, credits, year, degreeId, id], callback);
};

exports.deleteById = (id, callback) => {
  db.query("DELETE FROM modules WHERE id = ?", [id], callback);
};
