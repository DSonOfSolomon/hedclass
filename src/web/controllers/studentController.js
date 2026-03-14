const db = require("../models/db");

/*
Show all students
*/
exports.listStudents = (req, res) => {

    const sql = `
    SELECT students.*, degrees.name AS degree_name
    FROM students
    LEFT JOIN degrees ON students.degree_id = degrees.id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.send("Database error");
        }

        res.render("students", { students: results });

    });

};


/*
Show create student form
*/
exports.showCreateStudent = (req, res) => {

    const sql = "SELECT * FROM degrees";

    db.query(sql, (err, degrees) => {

        if (err) {
            console.error(err);
            return res.send("Database error");
        }

        res.render("create_student", { degrees });

    });

};


/*
Create student
*/
exports.createStudent = (req, res) => {

    const { name, student_number, degree_id } = req.body;

    const sql = `
    INSERT INTO students (name, student_number, degree_id)
    VALUES (?, ?, ?)
    `;

    db.query(sql, [name, student_number, degree_id], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error creating student");
        }

        res.redirect("/students");

    });

};


/*
Delete student
*/
exports.deleteStudent = (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id = ?";

    db.query(sql, [id], (err) => {

        if (err) {
            console.error(err);
            return res.send("Error deleting student");
        }

        res.redirect("/students");

    });

};
