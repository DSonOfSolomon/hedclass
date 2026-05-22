const Degree = require("../models/degreeModel");
const Module = require("../models/moduleModel");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getInteger, getTrimmedString } = require("../utils/validation");

exports.listModules = (req, res) => {
  const officerId = req.session.user.id;
  const degreeId = req.query.degree_id ? getInteger(req.query.degree_id, { min: 1 }) : null;
  const search = getTrimmedString(req.query.search, { maxLength: 100 });

  Module.findForOfficer({ officerId, degreeId, search }, (err, modules) => {
    if (err) {
      console.error("Module list query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to load modules.");
    }

    res.render("modules", {
      modules,
      search,
      degreeId,
    });
  });
};

exports.showCreateModule = (_req, res) => {
  Degree.findAll((err, degrees) => {
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

  Module.create({ name, credits, year, degreeId }, (err) => {
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

  Module.findById(id, (err, module) => {
    if (err) {
      console.error("Module lookup query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to load module details.");
    }

    if (!module) {
      return renderErrorPage(res, 404, "Module Not Found", "The requested module could not be found.");
    }

    Degree.findAll((err, degrees) => {
      if (err) {
        console.error("Degree lookup for module edit failed:", err.message);
        return renderErrorPage(res, 500, "Module Error", "Unable to load programme options.");
      }

      res.render("edit_module", {
        module,
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

  Module.update({ id, name, credits, year, degreeId }, (err) => {
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

  Module.deleteById(id, (err) => {
    if (err) {
      console.error("Delete module query failed:", err.message);
      return renderErrorPage(res, 500, "Module Error", "Unable to delete module.");
    }

    redirectWithFlash(req, res, "/modules", "success", "Module deleted.");
  });
};
