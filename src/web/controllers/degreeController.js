const db = require("../models/db");
const { getInteger, getTrimmedString } = require("../utils/validation");

exports.listDegrees = (req, res) => {
  const sql = "SELECT * FROM degrees";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Degree list query failed:", err.message);
      return res.status(500).send("Database error");
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
    return res.status(400).send("Valid degree details are required, and year weights must total 100.");
  }

  const sql = `
    INSERT INTO degrees (name, description, year2_weight, year3_weight)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, description, year2Weight, year3Weight], (err) => {
    if (err) {
      console.error("Create degree query failed:", err.message);
      return res.status(500).send("Error creating degree");
    }

    res.redirect("/admin/degrees");
  });
};

exports.deleteDegree = (req, res) => {
  const degreeId = getInteger(req.params.id, { min: 1 });

  if (!degreeId) {
    return res.status(400).send("Invalid degree id.");
  }

  const sql = "DELETE FROM degrees WHERE id = ?";

  db.query(sql, [degreeId], (err) => {
    if (err) {
      console.error("Delete degree query failed:", err.message);
      return res.status(500).send("Error deleting degree");
    }

    res.redirect("/admin/degrees");
  });
};

exports.showEditDegree = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return res.status(400).send("Invalid degree id.");
  }

  db.query("SELECT * FROM degrees WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Degree lookup query failed:", err.message);
      return res.status(500).send("Error");
    }

    res.render("edit_degree", { degree: result[0] });
  });
};

exports.updateDegree = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const description = getTrimmedString(req.body.description, { maxLength: 1000 });

  if (!id || !name) {
    return res.status(400).send("Valid degree details are required.");
  }

  db.query(
    "UPDATE degrees SET name = ?, description = ? WHERE id = ?",
    [name, description, id],
    (err) => {
      if (err) {
        console.error("Degree update query failed:", err.message);
        return res.status(500).send("Error");
      }

      res.redirect("/admin/degrees");
    }
  );
};
