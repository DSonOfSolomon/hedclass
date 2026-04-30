require("dotenv").config();

const mysql = require("mysql2");

function buildSslConfig() {
  const sslRequested =
    process.env.DB_SSL === "true" ||
    (process.env.NODE_ENV === "production" && process.env.DB_SSL !== "false");

  if (!sslRequested) {
    return undefined;
  }

  const ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
  };

  if (process.env.DB_SSL_CA_BASE64) {
    ssl.ca = Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8");
  }

  return ssl;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: buildSslConfig(),
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
