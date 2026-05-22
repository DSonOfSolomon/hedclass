const db = require("./db");

exports.findForOfficer = ({ officerId, degreeId, filter, search }, callback) => {
  let sql = `
    SELECT students.*, degrees.name AS degree_name
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const params = [officerId];

  if (degreeId) {
    sql += " AND students.degree_id = ?";
    params.push(degreeId);
  }

  if (filter === "review") {
    sql += " AND students.needs_review = 1";
  }

  if (search) {
    sql += " AND (students.name LIKE ? OR students.student_number LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  db.query(sql, params, callback);
};

exports.findAllWithDegree = ({ filter }, callback) => {
  let sql = `
    SELECT students.*, degrees.name AS degree_name
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
  `;

  if (filter === "review") {
    sql += " WHERE students.needs_review = 1";
  }

  db.query(sql, callback);
};

exports.findAll = (callback) => {
  db.query("SELECT * FROM students", callback);
};

exports.findById = (id, callback) => {
  db.query("SELECT * FROM students WHERE id = ?", [id], (err, results) => {
    callback(err, results?.[0] || null);
  });
};

exports.findAssignedDegrees = (officerId, callback) => {
  const sql = `
    SELECT degrees.*
    FROM degrees
    JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  db.query(sql, [officerId], callback);
};

exports.create = ({ name, studentNumber, degreeId }, callback) => {
  const sql = `
    INSERT INTO students (name, student_number, degree_id, classification)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, studentNumber, degreeId, "Pending"], callback);
};

exports.update = ({ id, name, studentNumber, degreeId }, callback) => {
  const sql = `
    UPDATE students
    SET name = ?, student_number = ?, degree_id = ?
    WHERE id = ?
  `;

  db.query(sql, [name, studentNumber, degreeId, id], callback);
};

exports.deleteById = (id, callback) => {
  db.query("DELETE FROM students WHERE id = ?", [id], callback);
};

exports.findClassificationInputs = (studentId, callback) => {
  const sql = `
    SELECT marks.mark, marks.is_resit, modules.credits, modules.year,
           degrees.year2_weight, degrees.year3_weight
    FROM marks
    JOIN modules ON marks.module_id = modules.id
    JOIN students ON marks.student_id = students.id
    JOIN degrees ON students.degree_id = degrees.id
    WHERE marks.student_id = ?
  `;

  db.query(sql, [studentId], callback);
};

exports.saveClassification = ({ studentId, outcome }, callback) => {
  const sql = `
    UPDATE students
    SET classification = ?, final_average = ?, year2_average = ?, year3_average = ?, rationale = ?, needs_review = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      outcome.classification,
      outcome.finalAverage,
      outcome.year2Average,
      outcome.year3Average,
      outcome.rationale,
      outcome.needsReview,
      studentId,
    ],
    callback
  );
};

exports.saveOverride = ({ id, overrideClassification, overrideReason }, callback) => {
  const sql = `
    UPDATE students
    SET override_classification = ?, override_reason = ?
    WHERE id = ?
  `;

  db.query(sql, [overrideClassification, overrideReason, id], callback);
};

exports.findProgrammeSummary = ({ degreeId, officerId }, callback) => {
  const programmeInfoSql = `
    SELECT degrees.id, degrees.name
    FROM degrees
    JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
    WHERE degrees.id = ? AND officer_degrees.officer_id = ?
  `;

  const studentCountSql = `
    SELECT COUNT(*) AS total_students
    FROM students
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE students.degree_id = ? AND officer_degrees.officer_id = ?
  `;

  const moduleCountSql = `
    SELECT COUNT(*) AS total_modules
    FROM modules
    JOIN officer_degrees ON modules.degree_id = officer_degrees.degree_id
    WHERE modules.degree_id = ? AND officer_degrees.officer_id = ?
  `;

  const markCountSql = `
    SELECT COUNT(*) AS total_marks
    FROM marks
    JOIN students ON marks.student_id = students.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE students.degree_id = ? AND officer_degrees.officer_id = ?
  `;

  const classificationSql = `
    SELECT
      CASE
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%First%' THEN 'First Class Honours (1st)'
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%2:1%' THEN 'Upper Second Class Honours (2:1)'
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%2:2%' THEN 'Lower Second Class Honours (2:2)'
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%Third%' THEN 'Third Class Honours'
        ELSE COALESCE(students.override_classification, students.classification)
      END AS final_classification,
      COUNT(*) AS count
    FROM students
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE students.degree_id = ?
      AND officer_degrees.officer_id = ?
      AND (students.classification IS NOT NULL OR students.override_classification IS NOT NULL)
    GROUP BY final_classification
  `;

  db.query(programmeInfoSql, [degreeId, officerId], (err, programmeResult) => {
    if (err) return callback(err);
    if (!programmeResult || programmeResult.length === 0) return callback(null, null);

    db.query(studentCountSql, [degreeId, officerId], (err, studentResult) => {
      if (err) return callback(err);

      db.query(moduleCountSql, [degreeId, officerId], (err, moduleResult) => {
        if (err) return callback(err);

        db.query(markCountSql, [degreeId, officerId], (err, markResult) => {
          if (err) return callback(err);

          db.query(classificationSql, [degreeId, officerId], (err, classifications) => {
            if (err) return callback(err);

            callback(null, {
              programme: programmeResult[0],
              students: studentResult?.[0]?.total_students || 0,
              modules: moduleResult?.[0]?.total_modules || 0,
              marks: markResult?.[0]?.total_marks || 0,
              classifications: classifications || [],
            });
          });
        });
      });
    });
  });
};
