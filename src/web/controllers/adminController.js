const bcrypt = require("bcrypt");
const Assignment = require("../models/assignmentModel");
const User = require("../models/userModel");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getEmail, getInteger, getTrimmedString } = require("../utils/validation");

exports.listOfficers = (_req, res) => {
  User.findOfficers((err, officers) => {
    if (err) {
      console.error("Officer list query failed:", err.message);
      return renderErrorPage(res, 500, "Officer Error", "Unable to load classification officers.");
    }

    res.render("admin_officers", { officers });
  });
};

exports.showCreateOfficer = (_req, res) => {
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

  User.createOfficer({ name, email, hashedPassword }, (err) => {
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

  User.deleteById(officerId, (err) => {
    if (err) {
      console.error("Delete officer query failed:", err.message);
      return renderErrorPage(res, 500, "Officer Error", "Unable to delete officer.");
    }

    redirectWithFlash(req, res, "/admin/officers", "success", "Classification officer deleted.");
  });
};

exports.showAssignPage = (_req, res) => {
  User.findOfficers((err, officers) => {
    if (err) {
      console.error("Assign page officers query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to load officers.");
    }

    Assignment.findUnassignedDegrees((err, degrees) => {
      if (err) {
        console.error("Assign page degrees query failed:", err.message);
        return renderErrorPage(res, 500, "Assignment Error", "Unable to load degrees.");
      }

      res.render("assign_officer", {
        officers,
        degrees,
      });
    });
  });
};

exports.assignOfficer = (req, res) => {
  const officerId = getInteger(req.body.officer_id, { min: 1 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!officerId || !degreeId) {
    return redirectWithFlash(req, res, "/admin/assign", "error", "A valid officer and degree are required.");
  }

  Assignment.findByDegreeId(degreeId, (err, assignments) => {
    if (err) {
      console.error("Assignment check query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to validate the assignment.");
    }

    if (assignments.length > 0) {
      return redirectWithFlash(
        req,
        res,
        "/admin/assign",
        "error",
        "This degree is already assigned to another officer."
      );
    }

    Assignment.create({ officerId, degreeId }, (err) => {
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
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/admin/officers", "error", "Invalid officer id.");
  }

  User.findOfficerById(id, (err, officer) => {
    if (err) {
      console.error("Officer lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Officer Error", "Unable to load officer details.");
    }

    if (!officer) {
      return renderErrorPage(res, 404, "Officer Not Found", "The requested officer could not be found.");
    }

    res.render("edit_officer", { officer });
  });
};

exports.updateOfficer = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 100 });
  const email = getEmail(req.body.email);

  if (!id || !name || !email) {
    return redirectWithFlash(req, res, `/admin/officers/edit/${req.params.id}`, "error", "Valid officer details are required.");
  }

  User.updateOfficer({ id, name, email }, (err) => {
    if (err) {
      console.error("Officer update query failed:", err.message);
      return renderErrorPage(res, 500, "Officer Error", "Unable to update officer details.");
    }

    redirectWithFlash(req, res, "/admin/officers", "success", "Officer details updated.");
  });
};

exports.listAssignments = (_req, res) => {
  Assignment.findAllWithNames((err, assignments) => {
    if (err) {
      console.error("Assignments query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to load assignments.");
    }

    res.render("manage_assignments", { assignments });
  });
};

exports.unassignOfficer = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/admin/assignments", "error", "Invalid assignment id.");
  }

  Assignment.deleteById(id, (err) => {
    if (err) {
      console.error("Unassign query failed:", err.message);
      return renderErrorPage(res, 500, "Assignment Error", "Unable to remove assignment.");
    }

    redirectWithFlash(req, res, "/admin/assignments", "success", "Assignment removed.");
  });
};
