// Import database connection
const db = require("../models/db");

// Import bcrypt for password hashing
const bcrypt = require("bcrypt");


/*
Show all classification officers
*/
exports.listOfficers = (req, res) => {

    const sql = "SELECT * FROM users WHERE role = 'officer'";

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database error");
        }

        // Render officer list page
        res.render("admin_officers", { officers: results });

    });

};


/*
Show create officer form
*/
exports.showCreateOfficer = (req, res) => {

    res.render("create_officer");

};


/*
Create a new officer
*/
exports.createOfficer = async (req, res) => {

    const { name, email, password } = req.body;

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, 'officer')
    `;

    db.query(sql, [name, email, hashedPassword], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error creating officer");
        }

        res.redirect("/admin/officers");

    });

};


/*
Delete an officer
*/
exports.deleteOfficer = (req, res) => {

    const officerId = req.params.id;

    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [officerId], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error deleting officer");
        }

        res.redirect("/admin/officers");

    });

};