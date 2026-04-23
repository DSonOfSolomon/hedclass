const db = require("../models/db");

const bcrypt = require("bcrypt");

exports.showLogin = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else {
      return res.redirect("/dashboard");
    }
  }
  res.render("login");
};

/*
 login form submission
*/
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    if (results.length === 0) {
      return res.send("User not found");
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Incorrect password");
    }

    req.session.user = user;

    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else {
      return res.redirect("/dashboard");
    }
  });
};

exports.dashboard = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const user = req.session.user;

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
  JOIN officer_degrees 
  ON degrees.id = officer_degrees.degree_id
  WHERE officer_degrees.officer_id = ?
`;

  const officerId = req.session.user.id;

  db.query(studentCountQuery, [officerId], (err, studentResult) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    db.query(degreeCountQuery, [officerId], (err, degreeResult) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }

      db.query(classificationQuery, [officerId], (err, classResults) => {
        if (err) {
          console.error(err);
          return res.send("Database error");
        }
        db.query(moduleCountQuery, [officerId], (err, moduleResult) => {
          if (err) return res.send("Database error");

          db.query(programmeQuery, [officerId], (err, programmeResults) => {
            if (err) {
              return res.send("Database error");
            }

            db.query(assignedDegreesQuery, [officerId], (err, assignedResults) => {
              if (err) {
                return res.send("Database error");
              }



            res.render("dashboard", {
              user: user,
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

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
