module.exports = function (req, res, next) {
  if (req.session.user) {
    return next();
  }

  return res.forbidden('Please Login First.');
}
