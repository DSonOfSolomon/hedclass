const db = require("../models/db");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getInteger, getTrimmedString } = require("../utils/validation");

exports.listModules = (req, res) => {
  const officerId = req.session.user.id;
  const degreeId = req.query.degree_id ? getInteger(req.query.degree_id, { min: 1 }) : null;
  const search = getTrimmedString(req.query.search, { maxLength: 100 });

  let sql = `
    SELECT modules.*, degrees.name AS degree_name
    FROM modules
    JOIN degrees ON modules.degree_id = degrees.id
    JOIN officer_degrees ON modules.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const params = [officerId];

  if (degreeId) {
    sql += " AND modules.degree_id = ?";
    params.push(degreeId);
  }

  if (search) {
    sql += " AND modules.name LIKE ?";
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Module list query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to load modules.");
    }

    res.render("modules", {
      modules: results,
      search,
      degreeId
    });
  });
};


exports.showCreateModule = (req, res) => {
  const sql = "SELECT * FROM degrees";

  db.query(sql, (err, degrees) => {
    if (err) {
      console.error("Module create page degree query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to load programme options.");
    }

    res.render("create_module", { degrees });
  });
};


exports.createModule = (req, res) => {
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const credits = getInteger(req.body.credits, { min: 1, max: 120 });
  const year = getInteger(req.body.year, { min: 1, max: 6 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!name || credits === null || year === null || !degreeId) {
    return redirectWithFlash(req, res, "/modules/create", "error", "Valid module details are required.");
  }

  const sql = `
    INSERT INTO modules (name, credits, year, degree_id)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, credits, year, degreeId], (err) => {
    if (err) {
      console.error("Create module query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to create module.");
    }

    redirectWithFlash(req, res, "/modules", "success", "Module created.");
  });
};


exports.showEditModule = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/modules", "error", "Invalid module id.");
  }

  const moduleQuery = "SELECT * FROM modules WHERE id = ?";
  const degreeQuery = "SELECT * FROM degrees";

  db.query(moduleQuery, [id], (err, moduleResult) => {
    if (err) {
      console.error("Module lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to load module details.");
    }

    db.query(degreeQuery, (err, degrees) => {
      if (err) {
        console.error("Degree lookup for module edit failed:", err.message);
        return renderErrorPage(res, 500, "Module Error", "Unable to load programme options.");
      }

      if (!moduleResult || moduleResult.length === 0) {
        return renderErrorPage(res, 404, "Module Not Found", "The requested module could not be found.");
      }

      res.render("edit_module", {
        module: moduleResult[0],
        degrees,
      });
    });
  });
};


exports.updateModule = (req, res) => {
    const id = getInteger(req.params.id, { min: 1 });
    const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
    const credits = getInteger(req.body.credits, { min: 1, max: 120 });
    const year = getInteger(req.body.year, { min: 1, max: 6 });
    const degreeId = getInteger(req.body.degree_id, { min: 1 });

    if (!id || !name || credits === null || year === null || !degreeId) {
      return redirectWithFlash(req, res, `/modules/edit/${req.params.id}`, "error", "Valid module details are required.");
    }

    const sql = `
    UPDATE modules
    SET name = ?, credits = ?, year = ?, degree_id = ?
    WHERE id = ?
    `;

    db.query(sql, [name, credits, year, degreeId, id], (err) => {

        if (err) {
            console.error("Update module query failed:", err.message);
            return renderErrorPage(res, 500, "Module Error", "Unable to update module.");
        }

        redirectWithFlash(req, res, "/modules", "success", "Module updated.");

    });

};


exports.deleteModule = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return redirectWithFlash(req, res, "/modules", "error", "Invalid module id.");
  }

  const sql = "DELETE FROM modules WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Delete module query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to delete module.");
    }

    redirectWithFlash(req, res, "/modules", "success", "Module deleted.");
  });
};
