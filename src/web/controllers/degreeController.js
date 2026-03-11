// Import database connection
const db = require("../models/db");


/*
Show all degrees
*/
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


/*
Show create degree form
*/
exports.showCreateDegree = (req, res) => {

    res.render("create_degree");

};


/*
Create a new degree
*/
exports.createDegree = (req, res) => {

    const { name, description } = req.body;

    const sql = `
        INSERT INTO degrees (name, description)
        VALUES (?, ?)
    `;

    db.query(sql, [name, description], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error creating degree");
        }

        res.redirect("/admin/degrees");

    });

};


/*
Delete degree
*/
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