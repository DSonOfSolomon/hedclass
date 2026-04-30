require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const degreeRoutes = require("./routes/degreeRoutes");
const studentRoutes = require("./routes/studentRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const markRoutes = require("./routes/markRoutes");
require("./models/db");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required.");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

if (isProduction) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use("/", adminRoutes);
app.use("/", authRoutes);
app.use("/", degreeRoutes);
app.use("/", studentRoutes);
app.use("/", moduleRoutes);
app.use("/", markRoutes);

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
  }

  res.redirect("/login");
});

app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).send(isProduction ? "An unexpected server error occurred." : "An unexpected server error occurred.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
