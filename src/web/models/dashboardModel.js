const db = require("./db");

exports.findOfficerDashboard = (officerId, callback) => {
  const studentCountQuery = `
    SELECT COUNT(*) AS total_students
    FROM students
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const degreeCountQuery = `
    SELECT COUNT(*) AS total_degrees
    FROM officer_degrees
    WHERE officer_id = ?
  `;

  const moduleCountQuery = `
    SELECT COUNT(*) AS total_modules
    FROM modules
    JOIN officer_degrees ON modules.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const programmeQuery = `
    SELECT degrees.id, degrees.name, COUNT(students.id) AS count
    FROM degrees
    JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
    LEFT JOIN students ON students.degree_id = degrees.id
    WHERE officer_degrees.officer_id = ?
    GROUP BY degrees.id
  `;

  const classificationQuery = `
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
    WHERE officer_degrees.officer_id = ?
      AND (students.classification IS NOT NULL OR students.override_classification IS NOT NULL)
    GROUP BY final_classification
  `;

  const assignedDegreesQuery = `
    SELECT degrees.id, degrees.name
    FROM degrees
    JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  db.query(studentCountQuery, [officerId], (err, studentResult) => {
    if (err) return callback(err);

    db.query(degreeCountQuery, [officerId], (err, degreeResult) => {
      if (err) return callback(err);

      db.query(classificationQuery, [officerId], (err, classResults) => {
        if (err) return callback(err);

        db.query(moduleCountQuery, [officerId], (err, moduleResult) => {
          if (err) return callback(err);

          db.query(programmeQuery, [officerId], (err, programmeResults) => {
            if (err) return callback(err);

            db.query(assignedDegreesQuery, [officerId], (err, assignedResults) => {
              if (err) return callback(err);

              callback(null, {
                students: studentResult[0].total_students,
                degrees: degreeResult[0].total_degrees,
                modules: moduleResult[0].total_modules,
                classifications: classResults,
                programmes: programmeResults,
                assignedDegrees: assignedResults,
              });
            });
          });
        });
      });
    });
  });
};

exports.findClassificationDashboard = (callback) => {
  const studentsSql = "SELECT COUNT(*) AS total FROM students";
  const degreesSql = "SELECT COUNT(*) AS total FROM degrees";
  const modulesSql = "SELECT COUNT(*) AS total FROM modules";

  const classificationSql = `
    SELECT classification, COUNT(*) AS count
    FROM students
    GROUP BY classification
  `;

  const programmeSql = `
    SELECT degrees.name, COUNT(students.id) AS count
    FROM degrees
    LEFT JOIN students ON students.degree_id = degrees.id
    GROUP BY degrees.id
  `;

  db.query(studentsSql, (err, studentRes) => {
    if (err) return callback(err);

    db.query(degreesSql, (err, degreeRes) => {
      if (err) return callback(err);

      db.query(modulesSql, (err, moduleRes) => {
        if (err) return callback(err);

        db.query(classificationSql, (err, classRes) => {
          if (err) return callback(err);

          db.query(programmeSql, (err, programmeRes) => {
            if (err) return callback(err);

            callback(null, {
              students: studentRes[0].total,
              degrees: degreeRes[0].total,
              modules: moduleRes[0].total,
              classifications: classRes,
              programmes: programmeRes,
            });
          });
        });
      });
    });
  });
};
