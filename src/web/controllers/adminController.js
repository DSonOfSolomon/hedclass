
const db = require("../models/db");


const bcrypt = require("bcrypt");


exports.listOfficers = (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'officer'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    
    res.render("admin_officers", { officers: results });
  });
};


exports.showCreateOfficer = (req, res) => {
  res.render("create_officer");
};


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
    WHERE degree_id = ?
    `;

  db.query(checkSql, [degree_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    // If assignment already exists, do not insert again
    if (results.length > 0) {
      return res.send("This degree is already assigned to another officer.");
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

exports.listAssignments = (req, res) => {
  const sql = `
    SELECT officer_degrees.id,
           users.name AS officer_name,
           degrees.name AS degree_name
    FROM officer_degrees
    JOIN users ON officer_degrees.officer_id = users.id
    JOIN degrees ON officer_degrees.degree_id = degrees.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    res.render("manage_assignments", { assignments: results });
  });
};


exports.unassignOfficer = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM officer_degrees WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error unassigning");
    }

    res.redirect("/admin/assignments");
  });
};
