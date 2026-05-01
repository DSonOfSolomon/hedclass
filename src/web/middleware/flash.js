function flashMiddleware(req, res, next) {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function redirectWithFlash(req, res, path, type, message) {
  setFlash(req, type, message);
  return res.redirect(path);
}

module.exports = {
  flashMiddleware,
  redirectWithFlash,
  setFlash,
};
