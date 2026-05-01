const db = require("../models/db");
const { redirectWithFlash } = require("../middleware/flash");
const { renderErrorPage } = require("../utils/rendering");
const { getInteger } = require("../utils/validation");

exports.exportCSV = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const officerId = req.session.user.id;
  const degreeId = getInteger(req.query.degree_id, { min: 1 });

  if (!degreeId) {
    return redirectWithFlash(req, res, "/dashboard", "error", "Please select a valid programme to export.");
  }

  const sql = `
    SELECT 
      students.name,
      students.student_number,
      degrees.name AS degree,
      students.classification,
      students.override_classification,
      students.final_average,
      students.rationale,
      students.override_reason
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
    AND students.degree_id = ?
  `;

  db.query(sql, [officerId, degreeId], (err, results) => {
    if (err) {
      console.error("CSV export query failed:", err.message);
      return renderErrorPage(res, 500, "Export Error", "Unable to export this programme right now.");
    }

    // CSV header
    let csv = 
    "Name,Student Number,Degree,System Classification,Override Classification, Final Average, Rationale, Override Reason\n";

    
    results.forEach((row) => {
      const safeRationale = (row.rationale || "").replace(/"/g, '""').replace(/\n/g, " ");
      const safeOverrideReason = (row.override_reason || "").replace(/"/g, '""').replace(/\n/g, " ");

      csv += `"${row.name}","${row.student_number}","${row.degree}","${row.classification || "Not Classified"}","${row.override_classification || "-"}","${row.final_average ?? "N/A"}","${safeRationale}","${safeOverrideReason || "-"}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("programme_classification_report.csv");
    res.send(csv);
  });
};
