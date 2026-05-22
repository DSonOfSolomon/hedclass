const db = require("./db");

exports.findProgrammeClassificationRows = ({ officerId, degreeId }, callback) => {
  const sql = `
    SELECT
      students.name,
      students.student_number,
      degrees.name AS degree,
      students.classification,
      students.override_classification,
      students.final_average,
      students.rationale,
      students.override_reason
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
    AND students.degree_id = ?
  `;

  db.query(sql, [officerId, degreeId], callback);
};
