// Import database connection
const db = require("../models/db");

// Import bcrypt for password hashing
const bcrypt = require("bcrypt");

/*
Show all classification officers
*/
exports.listOfficers = (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'officer'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    // Render officer list page
    res.render("admin_officers", { officers: results });
  });
};

/*
Show create officer form
*/
exports.showCreateOfficer = (req, res) => {
  res.render("create_officer");
};

/*
Create a new officer
*/
exports.createOfficer = async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, 'officer')
    `;

  db.query(sql, [name, email, hashedPassword], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error creating officer");
    }

    res.redirect("/admin/officers");
  });
};

/*
Delete an officer
*/
exports.deleteOfficer = (req, res) => {
  const officerId = req.params.id;

  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [officerId], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error deleting officer");
    }

    res.redirect("/admin/officers");
  });
};

/*
Show assignment page

This loads:
- all officers
- all degrees

so the admin can choose which officer manages which degree
*/
exports.showAssignPage = (req, res) => {
  const officersQuery = "SELECT * FROM users WHERE role = 'officer'";
  const degreesQuery = "SELECT * FROM degrees";

  db.query(officersQuery, (err, officers) => {
    if (err) {
      console.error(err);
      return res.send("Error loading officers");
    }

    db.query(degreesQuery, (err, degrees) => {
      if (err) {
        console.error(err);
        return res.send("Error loading degrees");
      }

      res.render("assign_officer", {
        officers: officers,
        degrees: degrees,
      });
    });
  });
};

/*
Assign officer to degree
Prevents duplicate assignments
*/
exports.assignOfficer = (req, res) => {
  const { officer_id, degree_id } = req.body;

  // First check if this assignment already exists
  const checkSql = `
    SELECT * FROM officer_degrees
    WHERE officer_id = ? AND degree_id = ?
    `;

  db.query(checkSql, [officer_id, degree_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    // If assignment already exists, do not insert again
    if (results.length > 0) {
      return res.send("This officer is already assigned to that degree.");
    }

    // Insert new assignment
    const insertSql = `
        INSERT INTO officer_degrees (officer_id, degree_id)
        VALUES (?, ?)
        `;

    db.query(insertSql, [officer_id, degree_id], (err) => {
      if (err) {
        console.error(err);
        return res.send("Error assigning officer");
      }

      res.redirect("/admin/assign");
    });
  });
};

exports.dashboard = (req, res) => {
  res.render("admin_dashboard", {
    user: req.session.user,
  });
};

exports.showEditOfficer = (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM users WHERE id = ? AND role = 'officer'",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error");
      }

      if (!result || result.length === 0) {
        return res.send("Officer not found");
      }

      res.render("edit_officer", { officer: result[0] });
    }
  );
};

exports.updateOfficer = (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ? AND role = 'officer'",
    [name, email, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.send("Error");
      }

      res.redirect("/admin/officers");
    }
  );
};