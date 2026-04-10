const db = require("../models/db");

exports.classificationDashboard = (req, res) => {

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
    if (err) return res.send("Error");

    db.query(degreesSql, (err, degreeRes) => {
      if (err) return res.send("Error");

      db.query(modulesSql, (err, moduleRes) => {
        if (err) return res.send("Error");

        db.query(classificationSql, (err, classRes) => {
          if (err) return res.send("Error");

          db.query(programmeSql, (err, programmeRes) => {
            if (err) return res.send("Error");

            res.render("dashboard", {
              user: req.session.user,
              students: studentRes[0].total,
              degrees: degreeRes[0].total,
              modules: moduleRes[0].total,
              classifications: classRes,
              programmes: programmeRes
            });
          });
        });
      });
    });
  });
};