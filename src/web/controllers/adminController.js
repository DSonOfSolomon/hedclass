const db = require("../models/db");
const bcrypt = require("bcrypt");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getEmail, getInteger, getTrimmedString } = require("../utils/validation");

exports.listOfficers = (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'officer'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Officer list query failed:", err.message);
      return renderErrorPage(res, 500, "Officer Error", "Unable to load classification officers.");
    }

    res.render("admin_officers", { officers: results });
  });
};

exports.showCreateOfficer = (req, res) => {
  res.render("create_officer");
};

exports.createOfficer = async (req, res) => {
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 100 });
  const email = getEmail(req.body.email);
  const password = getTrimmedString(req.body.password, { required: true, maxLength: 255 });

  if (!name || !email || !password || password.length < 8) {
    return redirectWithFlash(
      req,
      res,
      "/admin/officers/create",
      "error",
      "Valid officer details are required. Passwords must be at least 8 characters."
    );
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    console.error("Password hashing failed:", err.message);
    return renderErrorPage(res, 500, "Officer Error", "Unable to create officer right now.");
  }

  const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, 'officer')
    `;

  db.query(sql, [name, email, hashedPassword], (err) => {
    if (err) {
      console.error("Create officer query failed:", err.message);
      return redirectWithFlash(req, res, "/admin/officers/create", "error", "Unable to create officer.");
    }

    redirectWithFlash(req, res, "/admin/officers", "success", "Classification officer created.");
  });
};

exports.deleteOfficer = (req, res) => {
  const officerId = getInteger(req.params.id, { min: 1 });

  if (!officerId) {
    return redirectWithFlash(req, res, "/admin/officers", "error", "Invalid officer id.");
  }

  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [officerId], (err) => {
    if (err) {
      console.error("Delete officer query failed:", err.message);
      return renderErrorPage(res, 500, "Officer Error", "Unable to delete officer.");
    }

    redirectWithFlash(req, res, "/admin/officers", "success", "Classification officer deleted.");
  });
};

exports.showAssignPage = (req, res) => {
  const officersQuery = "SELECT * FROM users WHERE role = 'officer'";
  const degreesQuery = `
  SELECT * 
  FROM degrees
  WHERE id NOT IN (
  SELECT degree_ID
  FROM officer_degrees)
  `;

  db.query(officersQuery, (err, officers) => {
    if (err) {
      console.error("Assign page officers query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to load officers.");
    }

    db.query(degreesQuery, (err, degrees) => {
      if (err) {
        console.error("Assign page degrees query failed:", err.message);
        return renderErrorPage(res, 500, "Assignment Error", "Unable to load degrees.");
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
  const officerId = getInteger(req.body.officer_id, { min: 1 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!officerId || !degreeId) {
    return redirectWithFlash(req, res, "/admin/assign", "error", "A valid officer and degree are required.");
  }

  // First check if this assignment already exists
  const checkSql = `
    SELECT * FROM officer_degrees
    WHERE degree_id = ?
    `;

  db.query(checkSql, [degreeId], (err, results) => {
    if (err) {
      console.error("Assignment check query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to validate the assignment.");
    }

    // If assignment already exists, do not insert again
    if (results.length > 0) {
      return redirectWithFlash(
        req,
        res,
        "/admin/assign",
        "error",
        "This degree is already assigned to another officer."
      );
    }

    // Insert new assignment
    const insertSql = `
        INSERT INTO officer_degrees (officer_id, degree_id)
        VALUES (?, ?)
        `;

    db.query(insertSql, [officerId, degreeId], (err) => {
      if (err) {
        console.error("Assignment insert query failed:", err.message);
        return renderErrorPage(res, 500, "Assignment Error", "Unable to assign officer.");
      }

      redirectWithFlash(req, res, "/admin/assign", "success", "Officer assigned to degree.");
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
        console.error("Officer lookup query failed:", err.message);
        return renderErrorPage(res, 500, "Officer Error", "Unable to load officer details.");
      }

      if (!result || result.length === 0) {
        return renderErrorPage(res, 404, "Officer Not Found", "The requested officer could not be found.");
      }

      res.render("edit_officer", { officer: result[0] });
    }
  );
};

exports.updateOfficer = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 100 });
  const email = getEmail(req.body.email);

  if (!id || !name || !email) {
    return redirectWithFlash(req, res, `/admin/officers/edit/${req.params.id}`, "error", "Valid officer details are required.");
  }

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ? AND role = 'officer'",
    [name, email, id],
    (err) => {
      if (err) {
        console.error("Officer update query failed:", err.message);
        return renderErrorPage(res, 500, "Officer Error", "Unable to update officer details.");
      }

      redirectWithFlash(req, res, "/admin/officers", "success", "Officer details updated.");
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
      console.error("Assignments query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to load assignments.");
    }

    res.render("manage_assignments", { assignments: results });
  });
};

exports.unassignOfficer = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/admin/assignments", "error", "Invalid assignment id.");
  }

  db.query("DELETE FROM officer_degrees WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Unassign query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to remove assignment.");
    }

    redirectWithFlash(req, res, "/admin/assignments", "success", "Assignment removed.");
  });
};
