const ExpressError = require("./express_error.js");

function isLogin(req, res, next) {
  if (req.isAuthenticated()) next();
  else {
    req.flash("error", "Please login for a better experienced");
    res.redirect("/user/login");
  }
}

function isNotLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    req.flash("error", "You are already logged in");
    res.redirect("/product");
  }
}

module.exports = { isLogin, isNotLogin };
