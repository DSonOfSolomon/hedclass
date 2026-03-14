const db = require("../models/db");

/*
List all modules
*/
exports.listModules = (req, res) => {

    const sql = `
    SELECT modules.*, degrees.name AS degree_name
    FROM modules
    LEFT JOIN degrees ON modules.degree_id = degrees.id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database error");
        }

        res.render("modules", { modules: results });

    });

};


/*
Show create module form
*/
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


/*
Create module
*/
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


/*
Delete module
*/
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
