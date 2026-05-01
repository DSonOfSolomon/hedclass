
/*
Check if user is logged in
*/
exports.isAuthenticated = (req, res, next) => {

    
    if (!req.session.user) {
        return res.redirect("/login");
    }

    
    next();
};


/*
Check if user is an admin
*/
exports.isAdmin = (req, res, next) => {
    const { renderErrorPage } = require("../utils/rendering");
    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return renderErrorPage(res, 403, "Access Denied", "This page is available to admins only.");
    }

    next();
};


/*
Check if user is a classification officer
*/
exports.isOfficer = (req, res, next) => {
    const { renderErrorPage } = require("../utils/rendering");

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "officer") {
        return renderErrorPage(res, 403, "Access Denied", "This page is available to classification officers only.");
    }

    next();
};
