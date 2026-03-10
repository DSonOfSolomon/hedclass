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
exports.dashboard = (req, res) => {
  // If user is not logged in, redirect to login page
  if (!req.session.user) {
    return res.redirect("/login");
  }

  // Render dashboard and pass user data
  res.render("dashboard", { user: req.session.user });
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
