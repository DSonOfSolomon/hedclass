// Import database connection
const db = require("../models/db");

// Import bcrypt for password comparison
const bcrypt = require("bcrypt");

/*
This function displays the login page
*/
exports.showLogin = (req, res) => {
  res.render("login");
};

/*
This function handles login form submission
*/
exports.login = (req, res) => {
  // Get email and password from the form
  const { email, password } = req.body;

  // Query the database for a user with this email
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    // If no user found
    if (results.length === 0) {
      return res.send("User not found");
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Incorrect password");
    }

    // Save user in session
    req.session.user = user;

    /*
    Redirect based on role
    Admin → admin dashboard
    Officer → classification dashboard
    */
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    } else {
      return res.redirect("/dashboard");
    }
  });
};

/*
Dashboard page
This checks if a user session exists before allowing access
*/
/*
Dashboard page
Checks if user is logged in and shows system summary
*/
exports.dashboard = (req, res) => {
  // SECURITY: ensure user is logged in
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
  SELECT degrees.name, COUNT(students.id) AS count
  FROM degrees
  JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
  LEFT JOIN students ON students.degree_id = degrees.id
  WHERE officer_degrees.officer_id = ?
  GROUP BY degrees.id
`;
  const classificationQuery = `
  SELECT classification, COUNT(*) AS count
  FROM students
  JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
  WHERE officer_degrees.officer_id = ?
  GROUP BY classification
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

            res.render("dashboard", {
              user: user,
              students: studentResult[0].total_students,
              degrees: degreeResult[0].total_degrees,
              modules: moduleResult[0].total_modules,
              classifications: classResults,
              programmes: programmeResults,
            });
          });
        });
      });
    });
  });
};

/*
Logout function
Destroys the session
*/
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
