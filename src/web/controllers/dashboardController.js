const Dashboard = require("../models/dashboardModel");

exports.classificationDashboard = (req, res) => {
  Dashboard.findClassificationDashboard((err, metrics) => {
    if (err) return res.send("Error");

    res.render("dashboard", {
      user: req.session.user,
      students: metrics.students,
      degrees: metrics.degrees,
      modules: metrics.modules,
      classifications: metrics.classifications,
      programmes: metrics.programmes,
    });
  });
};
