const db = require("./db");

exports.findUnassignedDegrees = (callback) => {
  const sql = `
    SELECT *
    FROM degrees
    WHERE id NOT IN (
      SELECT degree_id
      FROM officer_degrees
    )
  `;

  db.query(sql, callback);
};

exports.findByDegreeId = (degreeId, callback) => {
  const sql = `
    SELECT * FROM officer_degrees
    WHERE degree_id = ?
  `;

  db.query(sql, [degreeId], callback);
};

exports.create = ({ officerId, degreeId }, callback) => {
  const sql = `
    INSERT INTO officer_degrees (officer_id, degree_id)
    VALUES (?, ?)
  `;

  db.query(sql, [officerId, degreeId], callback);
};

exports.findAllWithNames = (callback) => {
  const sql = `
    SELECT officer_degrees.id,
           users.name AS officer_name,
           degrees.name AS degree_name
    FROM officer_degrees
    JOIN users ON officer_degrees.officer_id = users.id
    JOIN degrees ON officer_degrees.degree_id = degrees.id
  `;

  db.query(sql, callback);
};

exports.deleteById = (id, callback) => {
  db.query("DELETE FROM officer_degrees WHERE id = ?", [id], callback);
};
