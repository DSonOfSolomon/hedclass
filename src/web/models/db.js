require("dotenv").config();

const mysql = require("mysql2");
const { getDatabaseConfig } = require("../config/database");

const pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }

  connection.release();
});

module.exports = pool;
