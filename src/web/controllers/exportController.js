const db = require("../models/db");

exports.exportCSV = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const officerId = req.session.user.id;

  const sql = `
    SELECT 
      students.name,
      students.student_number,
      degrees.name AS degree,
      students.classification,
      students.final_average
    FROM students
    JOIN degrees ON students.degree_id = degrees.id
    JOIN officer_degrees ON students.degree_id = officer_degrees.degree_id
    WHERE officer_degrees.officer_id = ?
  `;

  db.query(sql, [officerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.send("Database error");
    }

    // CSV header
    let csv = "Name,Student Number,Degree,Classification,Final Average\n";

    
    results.forEach(row => {
        csv += `"${row.name}","${row.student_number}","${row.degree}","${row.classification || 'Not Classified'}","${row.final_average || 'N/A'}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("classification_report.csv");
    res.send(csv);
  });
};