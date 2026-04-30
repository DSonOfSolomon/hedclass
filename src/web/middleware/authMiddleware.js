
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
    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "admin") {
        return res.status(403).send("Access denied: Admins only");
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
        return res.status(403).send("Access denied: Officers only");
    }

    next();
};
