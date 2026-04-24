const db = require("../models/db");


exports.listModules = (req, res) => {
  const officerId = req.session.user.id;
  const degreeId = req.query.degree_id;
  const search = req.query.search;

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
      console.error(err);
      return res.send("Database error");
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
      console.error(err);
      return res.send("Database error");
    }

    res.render("create_module", { degrees });
  });
};


exports.createModule = (req, res) => {
  const { name, credits, year, degree_id } = req.body;

  const sql = `
    INSERT INTO modules (name, credits, year, degree_id)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, credits, year, degree_id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error creating module");
    }

    res.redirect("/modules");
  });
};


exports.showEditModule = (req, res) => {
  const id = req.params.id;

  const moduleQuery = "SELECT * FROM modules WHERE id = ?";
  const degreeQuery = "SELECT * FROM degrees";

  db.query(moduleQuery, [id], (err, moduleResult) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    db.query(degreeQuery, (err, degrees) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }

      res.render("edit_module", {
        module: moduleResult[0],
        degrees,
      });
    });
  });
};


exports.updateModule = (req, res) => {

    const id = req.params.id;

    const { name, credits, year, degree_id } = req.body;

    const sql = `
    UPDATE modules
    SET name = ?, credits = ?, year = ?, degree_id = ?
    WHERE id = ?
    `;

    db.query(sql, [name, credits, year, degree_id, id], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error updating module");
        }

        res.redirect("/modules");

    });

};


exports.deleteModule = (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM modules WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error deleting module");
    }

    res.redirect("/modules");
  });
};
