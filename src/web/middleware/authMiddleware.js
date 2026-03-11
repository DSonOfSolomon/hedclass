/*
AUTHENTICATION MIDDLEWARE

Middleware functions run before a route is executed.
They are used for tasks like authentication, logging, validation etc.

Here we will check:
1. Is the user logged in?
2. Does the user have the correct role?
*/

/*
Check if user is logged in
*/
exports.isAuthenticated = (req, res, next) => {

    // If there is no user session, redirect to login
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // If session exists, continue to the next function/route
    next();
};


/*
Check if user is an admin
*/
exports.isAdmin = (req, res, next) => {

    // Ensure user is logged in first
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // Check role
    if (req.session.user.role !== "admin") {
        return res.send("Access denied: Admins only");
    }

    next();
};


/*
Check if user is a classification officer
*/
exports.isOfficer = (req, res, next) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "officer") {
        return res.send("Access denied: Officers only");
    }

    next();
};