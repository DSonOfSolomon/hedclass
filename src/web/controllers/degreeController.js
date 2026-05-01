const db = require("../models/db");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getInteger, getTrimmedString } = require("../utils/validation");

exports.listDegrees = (req, res) => {
  const sql = "SELECT * FROM degrees";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Degree list query failed:", err.message);
      return renderErrorPage(res, 500, "Programme Error", "Unable to load programmes.");
    }

    res.render("admin_degrees", { degrees: results });
  });
};

exports.showCreateDegree = (req, res) => {
  res.render("create_degree");
};

exports.createDegree = (req, res) => {
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const description = getTrimmedString(req.body.description, { maxLength: 1000 });
  const year2Weight = getInteger(req.body.year2_weight, { min: 0, max: 100 });
  const year3Weight = getInteger(req.body.year3_weight, { min: 0, max: 100 });

  if (!name || year2Weight === null || year3Weight === null || year2Weight + year3Weight !== 100) {
    return redirectWithFlash(
      req,
      res,
      "/admin/degrees/create",
      "error",
      "Valid programme details are required, and year weights must total 100."
    );
  }

  const sql = `
    INSERT INTO degrees (name, description, year2_weight, year3_weight)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, description, year2Weight, year3Weight], (err) => {
    if (err) {
      console.error("Create degree query failed:", err.message);
      return renderErrorPage(res, 500, "Programme Error", "Unable to create programme.");
    }

    redirectWithFlash(req, res, "/admin/degrees", "success", "Programme created.");
  });
};

exports.deleteDegree = (req, res) => {
  const degreeId = getInteger(req.params.id, { min: 1 });

  if (!degreeId) {
    return redirectWithFlash(req, res, "/admin/degrees", "error", "Invalid programme id.");
  }

  const sql = "DELETE FROM degrees WHERE id = ?";

  db.query(sql, [degreeId], (err) => {
    if (err) {
      console.error("Delete degree query failed:", err.message);
      return renderErrorPage(res, 500, "Programme Error", "Unable to delete programme.");
    }

    redirectWithFlash(req, res, "/admin/degrees", "success", "Programme deleted.");
  });
};

exports.showEditDegree = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/admin/degrees", "error", "Invalid programme id.");
  }

  db.query("SELECT * FROM degrees WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Degree lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Programme Error", "Unable to load programme details.");
    }

    if (!result || result.length === 0) {
      return renderErrorPage(res, 404, "Programme Not Found", "The requested programme could not be found.");
    }

    res.render("edit_degree", { degree: result[0] });
  });
};

exports.updateDegree = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const description = getTrimmedString(req.body.description, { maxLength: 1000 });

  if (!id || !name) {
    return redirectWithFlash(req, res, `/admin/degrees/edit/${req.params.id}`, "error", "Valid programme details are required.");
  }

  db.query(
    "UPDATE degrees SET name = ?, description = ? WHERE id = ?",
    [name, description, id],
    (err) => {
      if (err) {
        console.error("Degree update query failed:", err.message);
        return renderErrorPage(res, 500, "Programme Error", "Unable to update programme details.");
      }

      redirectWithFlash(req, res, "/admin/degrees", "success", "Programme updated.");
    }
  );
};
