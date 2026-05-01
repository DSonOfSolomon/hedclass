function renderErrorPage(res, status, title, message) {
  return res.status(status).render("error", {
    status,
    title,
    message,
  });
}

module.exports = {
  renderErrorPage,
};
