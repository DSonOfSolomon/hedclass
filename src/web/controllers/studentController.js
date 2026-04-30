const db = require("../models/db");
const { getClassification, getInteger, getTrimmedString } = require("../utils/validation");

exports.listStudents = (req, res) => {
  const filter = req.query.filter;
  const degreeId = req.query.degree_id ? getInteger(req.query.degree_id, { min: 1 }) : null;
  const officerId = req.session.user.id;
  const search = getTrimmedString(req.query.search, { maxLength: 100 });

  let sql = `
    SELECT students.*, degrees.name AS degree_name
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  const params = [officerId];

  if (degreeId) {
    sql += " AND students.degree_id = ?";
    params.push(degreeId);
  }

  if (filter === "review") {
    sql += " AND students.needs_review = 1";
  }

  if (search) {
    sql += " AND (students.name LIKE ? OR students.student_number LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const degreeSql = `
    SELECT degrees.*
    FROM degrees
    JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  db.query(sql, params, (err, students) => {
    if (err) {
      console.error("Student list query failed:", err.message);
      return res.status(500).send("Database error");
    }

    db.query(degreeSql, [officerId], (err, degrees) => {
      if (err) {
        console.error("Student degree filter query failed:", err.message);
        return res.status(500).send("Database error");
      }

      res.render("students", { students, degrees, search });
    });
  });
};

exports.showCreateStudent = (req, res) => {
  const sql = "SELECT * FROM degrees";

  db.query(sql, (err, degrees) => {
    if (err) {
      console.error("Student create page degree query failed:", err.message);
      return res.status(500).send("Database error");
    }

    res.render("create_student", { degrees });
  });
};

exports.createStudent = (req, res) => {
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const studentNumber = getTrimmedString(req.body.student_number, { required: true, maxLength: 50 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!name || !studentNumber || !degreeId) {
    return res.status(400).send("Valid student details are required.");
  }

  const sql = `
    INSERT INTO students (name, student_number, degree_id, classification)
    VALUES (?, ?, ?, ?)
    `;

  db.query(sql, [name, studentNumber, degreeId, "Pending"], (err) => {
    if (err) {
      console.error("Create student query failed:", err.message);
      return res.status(500).send("Error creating student");
    }

    res.redirect("/students");
  });
};

exports.showEditStudent = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return res.status(400).send("Invalid student id.");
  }

  const studentQuery = "SELECT * FROM students WHERE id = ?";
  const degreeQuery = "SELECT * FROM degrees";

  db.query(studentQuery, [id], (err, studentResult) => {
    if (err) {
      console.error("Student lookup query failed:", err.message);
      return res.status(500).send("Database error");
    }

    db.query(degreeQuery, (err, degrees) => {
      if (err) {
        console.error("Degree lookup for student edit failed:", err.message);
        return res.status(500).send("Database error");
      }

      res.render("edit_student", {
        student: studentResult[0],
        degrees,
      });
    });
  });
};

exports.updateStudent = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const name = getTrimmedString(req.body.name, { required: true, maxLength: 150 });
  const studentNumber = getTrimmedString(req.body.student_number, { required: true, maxLength: 50 });
  const degreeId = getInteger(req.body.degree_id, { min: 1 });

  if (!id || !name || !studentNumber || !degreeId) {
    return res.status(400).send("Valid student details are required.");
  }

  const sql = `
    UPDATE students
    SET name = ?, student_number = ?, degree_id = ?
    WHERE id = ?
    `;

  db.query(sql, [name, studentNumber, degreeId, id], (err) => {
    if (err) {
      console.error("Update student query failed:", err.message);
      return res.status(500).send("Error updating student");
    }

    res.redirect("/students");
  });
};

exports.deleteStudent = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return res.status(400).send("Invalid student id.");
  }

  const sql = "DELETE FROM students WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Delete student query failed:", err.message);
      return res.status(500).send("Error deleting student");
    }

    res.redirect("/students");
  });
};

exports.classifyStudent = (req, res) => {
  const studentId = getInteger(req.params.id, { min: 1 });

  if (!studentId) {
    return res.status(400).send("Invalid student id.");
  }

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
      console.error("Classification lookup query failed:", err.message);
      return res.status(500).send("Database error");
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
          console.error("Classification update query failed:", err.message);
          return res.status(500).send("Error updating classification");
        }

        res.redirect("/students#student-" + studentId);
      }
    );
  });
};

exports.showOverrideForm = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });

  if (!id) {
    return res.status(400).send("Invalid student id.");
  }

  const sql = "SELECT * FROM students WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Override form query failed:", err.message);
      return res.status(500).send("Database error");
    }

    res.render("override_student", { student: result[0] });
  });
};

exports.saveOverride = (req, res) => {
  const id = getInteger(req.params.id, { min: 1 });
  const overrideClassification = getClassification(req.body.override_classification);
  const overrideReason = getTrimmedString(req.body.override_reason, {
    required: true,
    maxLength: 1000,
  });

  if (!id || !overrideClassification || !overrideReason) {
    return res.status(400).send("A valid override classification and reason are required.");
  }

  const sql = `
    UPDATE students
    SET override_classification = ?, override_reason = ?
    WHERE id = ?
  `;

  db.query(sql, [overrideClassification, overrideReason, id], (err) => {
    if (err) {
      console.error("Override update query failed:", err.message);
      return res.status(500).send("Error saving override");
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
    if (err) {
      console.error("Student export query failed:", err.message);
      return res.status(500).send("Database error");
    }
    res.render("students", { students: results });
  });
};

exports.showProgrammeDetails = (req, res) => {
  const degreeId = getInteger(req.params.id, { min: 1 });
  const officerId = req.session.user.id;

  if (!degreeId) {
    return res.status(400).send("Invalid programme id.");
  }

  const programmeInfoSql = `
    SELECT degrees.id, degrees.name
    FROM degrees
    JOIN officer_degrees ON degrees.id = officer_degrees.degree_id
    WHERE degrees.id = ? AND officer_degrees.officer_id = ?
  `;

  const studentCountSql = `
    SELECT COUNT(*) AS total_students
    FROM students
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE students.degree_id = ? AND officer_degrees.officer_id = ?
  `;

  const moduleCountSql = `
    SELECT COUNT(*) AS total_modules
    FROM modules
    JOIN officer_degrees ON modules.degree_id = officer_degrees.degree_id
    WHERE modules.degree_id = ? AND officer_degrees.officer_id = ?
  `;

  const markCountSql = `
    SELECT COUNT(*) AS total_marks
    FROM marks
    JOIN students ON marks.student_id = students.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE students.degree_id = ? AND officer_degrees.officer_id = ?
  `;

  const classificationSql = `
    SELECT 
      CASE 
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%First%' THEN 'First Class Honours (1st)'
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%2:1%' THEN 'Upper Second Class Honours (2:1)'
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%2:2%' THEN 'Lower Second Class Honours (2:2)'
        WHEN COALESCE(students.override_classification, students.classification) LIKE '%Third%' THEN 'Third Class Honours'
        ELSE COALESCE(students.override_classification, students.classification)
      END AS final_classification,
      COUNT(*) AS count
    FROM students
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE students.degree_id = ?
      AND officer_degrees.officer_id = ?
      AND (students.classification IS NOT NULL OR students.override_classification IS NOT NULL)
    GROUP BY final_classification
  `;

  db.query(programmeInfoSql, [degreeId, officerId], (err, programmeResult) => {
    if (err) {
      console.error("Programme info query failed:", err.message);
      return res.status(500).send("Database error");
    }

    if (!programmeResult || programmeResult.length === 0) {
      return res.send("Programme not found or access denied");
    }

    db.query(studentCountSql, [degreeId, officerId], (err, studentResult) => {
      if (err) {
        console.error("Programme student count query failed:", err.message);
        return res.status(500).send("Database error");
      }

      db.query(moduleCountSql, [degreeId, officerId], (err, moduleResult) => {
        if (err) {
          console.error("Programme module count query failed:", err.message);
          return res.status(500).send("Database error");
        }

        db.query(markCountSql, [degreeId, officerId], (err, markResult) => {
          if (err) {
            console.error("Programme mark count query failed:", err.message);
            return res.status(500).send("Database error");
          }

          db.query(classificationSql, [degreeId, officerId], (err, classifications) => {
            if (err) {
              console.error("Programme classification query failed:", err.message);
              return res.status(500).send("Database error");
            }

            res.render("programme_details", {
              programme: programmeResult[0],
              students: studentResult?.[0]?.total_students || 0,
              modules: moduleResult?.[0]?.total_modules || 0,
              marks: markResult?.[0]?.total_marks || 0,
              classifications: classifications || []
            });
          });
        });
      });
    });
  });
};
