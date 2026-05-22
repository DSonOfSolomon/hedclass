const db = require("./db");

exports.findAll = (callback) => {
  db.query("SELECT * FROM degrees", callback);
};

exports.findById = (id, callback) => {
  db.query("SELECT * FROM degrees WHERE id = ?", [id], (err, results) => {
    callback(err, results?.[0] || null);
  });
};

exports.create = ({ name, description, year2Weight, year3Weight }, callback) => {
  const sql = `
    INSERT INTO degrees (name, description, year2_weight, year3_weight)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, description, year2Weight, year3Weight], callback);
};

exports.update = ({ id, name, description }, callback) => {
  db.query("UPDATE degrees SET name = ?, description = ? WHERE id = ?", [name, description, id], callback);
};

exports.deleteById = (id, callback) => {
  db.query("DELETE FROM degrees WHERE id = ?", [id], callback);
};
