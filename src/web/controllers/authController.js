const db = require("../models/db");
const bcrypt = require("bcrypt");
const { getEmail, getTrimmedString } = require("../utils/validation");

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
  const email = getEmail(req.body.email);
  const password = getTrimmedString(req.body.password, { required: true, maxLength: 255 });

  if (!email || !password) {
    return res.status(400).send("A valid email and password are required.");
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Login query failed:", err.message);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(401).send("Invalid email or password.");
    }

    const user = results[0];
    let match = false;

    try {
      match = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      console.error("Password comparison failed:", compareError.message);
      return res.status(500).send("Unable to process login.");
    }

    if (!match) {
      return res.status(401).send("Invalid email or password.");
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

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
      console.error("Dashboard student query failed:", err.message);
      return res.status(500).send("Database error");
    }

    db.query(degreeCountQuery, [officerId], (err, degreeResult) => {
      if (err) {
        console.error("Dashboard degree query failed:", err.message);
        return res.status(500).send("Database error");
      }

      db.query(classificationQuery, [officerId], (err, classResults) => {
        if (err) {
          console.error("Dashboard classification query failed:", err.message);
          return res.status(500).send("Database error");
        }
        db.query(moduleCountQuery, [officerId], (err, moduleResult) => {
          if (err) {
            console.error("Dashboard module query failed:", err.message);
            return res.status(500).send("Database error");
          }

          db.query(programmeQuery, [officerId], (err, programmeResults) => {
            if (err) {
              console.error("Dashboard programme query failed:", err.message);
              return res.status(500).send("Database error");
            }

            db.query(assignedDegreesQuery, [officerId], (err, assignedResults) => {
              if (err) {
                console.error("Dashboard assigned degrees query failed:", err.message);
                return res.status(500).send("Database error");
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
