const session = require("express-session");

function createSessionMiddleware() {
  if (process.env.NODE_ENV === "test" || process.env.SESSION_STORE === "memory") {
    return session({
      secret: process.env.SESSION_SECRET || "test-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
      },
    });
  }

  const MySQLStore = require("express-mysql-session")(session);
  const { getDatabaseConfig } = require("./config/database");
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET;

  const store = new MySQLStore(
    {
      clearExpired: true,
      checkExpirationInterval: 15 * 60 * 1000,
      expiration: 24 * 60 * 60 * 1000,
      createDatabaseTable: true,
    },
    getDatabaseConfig()
  );

  return session({
    secret: sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  });
}

module.exports = {
  createSessionMiddleware,
};
