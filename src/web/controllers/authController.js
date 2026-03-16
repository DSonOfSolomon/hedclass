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

    /*
        If password is correct, create a session.
        We store basic user information inside the session object.
        */

    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    // Redirect user to dashboard
    res.redirect("/dashboard");
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

  const studentCountQuery = "SELECT COUNT(*) AS total_students FROM students";
  const degreeCountQuery = "SELECT COUNT(*) AS total_degrees FROM degrees";
  const officerCountQuery =
    "SELECT COUNT(*) AS total_officers FROM users WHERE role='officer'";

  const classificationQuery = `
  SELECT classification, COUNT(*) AS count
  FROM students
  GROUP BY classification
  `;

  db.query(studentCountQuery, (err, studentResult) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    db.query(degreeCountQuery, (err, degreeResult) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }

      db.query(officerCountQuery, (err, officerResult) => {
        if (err) {
          console.error(err);
          return res.send("Database error");
        }

        db.query(classificationQuery, (err, classResults) => {
          if (err) {
            console.error(err);
            return res.send("Database error");
          }

          res.render("dashboard", {
            user: user,
            students: studentResult[0].total_students,
            degrees: degreeResult[0].total_degrees,
            officers: officerResult[0].total_officers,
            classifications: classResults,
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
    res.redirect("/login");
  });
};
