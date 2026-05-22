const bcrypt = require("bcrypt");
const Dashboard = require("../models/dashboardModel");
const User = require("../models/userModel");
const { setFlash } = require("../middleware/flash");
const { getEmail, getTrimmedString } = require("../utils/validation");
const { renderErrorPage } = require("../utils/rendering");

exports.showLogin = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/dashboard");
  }

  res.render("login", { formData: { email: "" } });
};

exports.login = (req, res) => {
  const email = getEmail(req.body.email);
  const password = getTrimmedString(req.body.password, { required: true, maxLength: 255 });

  if (!email || !password) {
    return res.status(400).render("login", {
      error: "A valid email and password are required.",
      formData: { email: req.body.email || "" },
    });
  }

  User.findByEmail(email, async (err, user) => {
    if (err) {
      console.error("Login query failed:", err.message);
      return renderErrorPage(res, 500, "Login Error", "The login service is temporarily unavailable.");
    }

    if (!user) {
      return res.status(401).render("login", {
        error: "Invalid email or password.",
        formData: { email },
      });
    }

    let match = false;

    try {
      match = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      console.error("Password comparison failed:", compareError.message);
      return renderErrorPage(res, 500, "Login Error", "Unable to process login at the moment.");
    }

    if (!match) {
      return res.status(401).render("login", {
        error: "Invalid email or password.",
        formData: { email },
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    setFlash(req, "success", `Signed in as ${user.name}.`);

    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/dashboard");
  });
};

exports.dashboard = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const user = req.session.user;
  const officerId = user.id;

  Dashboard.findOfficerDashboard(officerId, (err, metrics) => {
    if (err) {
      console.error("Dashboard query failed:", err.message);
      return renderErrorPage(res, 500, "Dashboard Error", "Unable to load dashboard metrics.");
    }

    res.render("dashboard", {
      user,
      students: metrics.students,
      degrees: metrics.degrees,
      modules: metrics.modules,
      classifications: metrics.classifications,
      programmes: metrics.programmes,
      assignedDegrees: metrics.assignedDegrees,
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
