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
    INSERT INTO students (name, student_number, degree_id, classification)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, student_number, degree_id, "Pending",], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error creating student");
    }

    res.redirect("/students");
  });
};

/*
Show edit student form
*/
exports.showEditStudent = (req, res) => {
  const id = req.params.id;

  const studentQuery = "SELECT * FROM students WHERE id = ?";
  const degreeQuery = "SELECT * FROM degrees";

  db.query(studentQuery, [id], (err, studentResult) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    db.query(degreeQuery, (err, degrees) => {
      if (err) {
        console.error(err);
        return res.send("Database error");
      }

      res.render("edit_student", {
        student: studentResult[0],
        degrees,
      });
    });
  });
};

/*
Update student
*/
exports.updateStudent = (req, res) => {
  const id = req.params.id;
  const { name, student_number, degree_id } = req.body;

  const sql = `
    UPDATE students
    SET name = ?, student_number = ?, degree_id = ?
    WHERE id = ?
    `;

  db.query(sql, [name, student_number, degree_id, id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error updating student");
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

/*
Classify a student based on module marks
*/
exports.classifyStudent = (req, res) => {
  const studentId = req.params.id;

  const sql = `
    SELECT marks.mark, marks.is_resit, modules.credits, modules.year
    FROM marks
    JOIN modules ON marks.module_id = modules.id
    WHERE marks.student_id = ?
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    let year2Total = 0;
    let year2Credits = 0;

    let year3Total = 0;
    let year3Credits = 0;

    results.forEach((row) => {
      // Apply resit cap rule
      let markForCalculation = row.mark;

      if (row.is_resit && row.mark > 40) {
        markForCalculation = 40;
      }

      const weighted = markForCalculation * row.credits;

      if (row.year == 2) {
        year2Total += weighted;
        year2Credits += row.credits;
      }

      if (row.year == 3) {
        year3Total += weighted;
        year3Credits += row.credits;
      }
    });

    // Prevent division by zero
    const year2Average = year2Credits ? year2Total / year2Credits : 0;
    const year3Average = year3Credits ? year3Total / year3Credits : 0;

    const finalAverage = year2Average * 0.3 + year3Average * 0.7;

    let classification;

    if (finalAverage >= 70) classification = "First";
    else if (finalAverage >= 60) classification = "2:1";
    else if (finalAverage >= 50) classification = "2:2";
    else if (finalAverage >= 40) classification = "Third";
    else classification = "Fail";

    const rationale = `
    Year 2 Average: ${year2Average.toFixed(2)}
    Year 3 Average: ${year3Average.toFixed(2)}

    Final Calculation:
    (${year2Average.toFixed(2)} × 0.30) + (${year3Average.toFixed(2)} × 0.70)

    Final Average: ${finalAverage.toFixed(2)}
    Classification: ${classification}
    `;

    

    const updateSql = `
      UPDATE students
      SET classification = ?, final_average = ?, year2_average = ?, year3_average = ?, rationale = ?
      WHERE id = ?
    `;

    db.query(
      updateSql,
      [classification, finalAverage, year2Average, year3Average, rationale, studentId],
      (err) => {
        if (err) {
          console.error(err);
          return res.send("Error updating classification");
        }

        res.redirect("/students");
      }
    );
  });
};

exports.showOverrideForm = (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM students WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    res.render("override_student", { student: result[0] });
  });
};

exports.saveOverride = (req, res) => {
  const id = req.params.id;
  const { classification } = req.body;

  const sql = `
    UPDATE students
    SET classification = ?
    WHERE id = ?
  `;

  db.query(sql, [classification, id], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error saving override");
    }

    res.redirect("/students");
  });
};