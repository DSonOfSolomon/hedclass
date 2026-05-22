const db = require("./db");

exports.findByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    callback(err, results?.[0] || null);
  });
};

exports.findOfficers = (callback) => {
  db.query("SELECT * FROM users WHERE role = 'officer'", callback);
};

exports.findOfficerById = (id, callback) => {
  db.query("SELECT * FROM users WHERE id = ? AND role = 'officer'", [id], (err, results) => {
    callback(err, results?.[0] || null);
  });
};

exports.createOfficer = ({ name, email, hashedPassword }, callback) => {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, 'officer')
  `;

  db.query(sql, [name, email, hashedPassword], callback);
};

exports.updateOfficer = ({ id, name, email }, callback) => {
  db.query("UPDATE users SET name = ?, email = ? WHERE id = ? AND role = 'officer'", [name, email, id], callback);
};

exports.deleteById = (id, callback) => {
  db.query("DELETE FROM users WHERE id = ?", [id], callback);
};
