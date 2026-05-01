require("dotenv").config();

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

function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: buildSslConfig(),
  };
}

module.exports = {
  buildSslConfig,
  getDatabaseConfig,
};
