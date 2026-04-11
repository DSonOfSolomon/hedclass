
const db = require("../models/db");



exports.listDegrees = (req, res) => {

    const sql = "SELECT * FROM degrees";

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database error");
        }

        res.render("admin_degrees", { degrees: results });

    });

};



exports.showCreateDegree = (req, res) => {

    res.render("create_degree");

};



exports.createDegree = (req, res) => {

    const { name, description, year2_weight, year3_weight } = req.body;

    const sql = `
        INSERT INTO degrees (name, description, year2_weight, year3_weight)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, description, year2_weight, year3_weight], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error creating degree");
        }

        res.redirect("/admin/degrees");

    });

};



exports.deleteDegree = (req, res) => {

    const degreeId = req.params.id;

    const sql = "DELETE FROM degrees WHERE id = ?";

    db.query(sql, [degreeId], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error deleting degree");
        }

        res.redirect("/admin/degrees");

    });

};

exports.showEditDegree = (req, res) => {
    const id = req.params.id;
  
    db.query("SELECT * FROM degrees WHERE id = ?", [id], (err, result) => {
      if (err) return res.send("Error");
  
      res.render("edit_degree", { degree: result[0] });
    });
  };
  
  exports.updateDegree = (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body;
  
    db.query(
      "UPDATE degrees SET name = ?, description = ? WHERE id = ?",
      [name, description, id],
      (err) => {
        if (err) return res.send("Error");
  
        res.redirect("/admin/degrees");
      }
    );
  };