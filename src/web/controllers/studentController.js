const db = require("../models/db");

exports.listStudents = (req, res) => {
  const filter = req.query.filter;
  const officerId = req.session.user.id;
  let sql = `
     SELECT students.*, degrees.name AS degree_name
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  if (filter === "review") {
    sql += " AND students.needs_review = 1";
  }

  db.query(sql, [officerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    res.render("students", { students: results });
  });
};

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

exports.createStudent = (req, res) => {
  const { name, student_number, degree_id } = req.body;

  const sql = `
    INSERT INTO students (name, student_number, degree_id, classification)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, student_number, degree_id, "Pending"], (err) => {
    if (err) {
      console.error(err);
      return res.send("Error creating student");
    }

    res.redirect("/students");
  });
};

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

exports.classifyStudent = (req, res) => {
  const studentId = req.params.id;

  const sql = `
  SELECT marks.mark, marks.is_resit, modules.credits, modules.year,
         degrees.year2_weight, degrees.year3_weight
  FROM marks
  JOIN modules ON marks.module_id = modules.id
  JOIN students ON marks.student_id = students.id
  JOIN degrees ON students.degree_id = degrees.id
  WHERE marks.student_id = ?
`;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    if (!results || results.length === 0) {
      return res.send("No marks found for student");
    }

    let year2Total = 0;
    let year2Credits = 0;

    let year3Total = 0;
    let year3Credits = 0;

    let hasFail = false;
    let missingCredits = false;
    let needsReview = false;

    results.forEach((row) => {
      let markForCalculation = row.mark;

      if (row.is_resit && row.mark > 40) {
        markForCalculation = 40;
      }

      if (markForCalculation < 40) {
        hasFail = true;
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

    // Ensure full credit requirement is met
    if (year2Credits !== 120 || year3Credits !== 120) {
      missingCredits = true;
    }

    const y2w = results[0].year2_weight / 100;
    const y3w = results[0].year3_weight / 100;

    const finalAverage = year2Average * y2w + year3Average * y3w;

    let classification;

    if (hasFail || missingCredits) {
      classification = "Not Eligible (Fail)";
    } else if (finalAverage >= 70) classification = "First Class Honours (1st)";
    else if (finalAverage >= 60)
      classification = "Upper Second Class Honours (2:1)";
    else if (finalAverage >= 50)
      classification = "Lower Second Class Honours (2:2)";
    else if (finalAverage >= 40) classification = "Third Class Honours";
    else classification = "Fail";

    let rationale = `
    Year 2 Average: ${year2Average.toFixed(2)}
    Year 3 Average: ${year3Average.toFixed(2)}
    
    Final Calculation:
    (${year2Average.toFixed(2)} × ${y2w}) + (${year3Average.toFixed(
      2
    )} × ${y3w})
    
    Final Average: ${finalAverage.toFixed(2)}
    Classification: ${classification}
    `;

    if (year2Credits !== 120 || year3Credits !== 120) {
      rationale +=
        "\n⚠️ Student does not have full 120 credits for Year 2 or Year 3.";
    }

    if (hasFail) {
      rationale +=
        "\n⚠️ Student has failed modules → Not eligible for honours classification.";
    }

    if (missingCredits) {
      rationale +=
        "\n⚠️ Student does not have full 120 credits for Year 2 or Year 3.";
    }

    // Flag if student has fails
    if (hasFail || missingCredits) {
      needsReview = true;
    }

    // Flag borderline cases (within 1% of boundary)
    if (
      (finalAverage >= 69 && finalAverage < 70) ||
      (finalAverage >= 59 && finalAverage < 60) ||
      (finalAverage >= 49 && finalAverage < 50) ||
      (finalAverage >= 39 && finalAverage < 40)
    ) {
      needsReview = true;
    }

    if (needsReview) {
      rationale += "\n🔍 Flagged for manual review (borderline or rule issue).";
    }

    const updateSql = `
      UPDATE students
      SET classification = ?, final_average = ?, year2_average = ?, year3_average = ?, rationale = ?, needs_review = ?
      WHERE id = ?
    `;

    db.query(
      updateSql,
      [
        classification,
        finalAverage,
        year2Average,
        year3Average,
        rationale,
        needsReview,
        studentId,
      ],
      (err) => {
        if (err) {
          console.error(err);
          return res.send("Error updating classification");
        }

        res.redirect("/students#student-" + studentId);
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

exports.getStudents = (req, res) => {
  const filter = req.query.filter;

  let sql = `
    SELECT students.*, degrees.name AS degree_name
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
  `;

  if (filter === "review") {
    sql += " WHERE students.needs_review = 1";
  }

  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render("students", { students: results });
  });
};
