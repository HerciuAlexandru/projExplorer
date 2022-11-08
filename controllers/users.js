const User = require("../models/user");
const { isLoggedIn } = require("../utility/middleware");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registerUser = await User.register(user, password);
    req.login(registerUser, (err) => {
      // login dupa register
      if (err) return next(err);
      req.flash("success", "Welcome");
      res.redirect("/farms");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back !");
  let redirectTo = "/farms"; // Set default redirect value
  if (req.session.reqUrl) {
    redirectTo = req.session.reqUrl; // If our redirect value exists in the session, use that.
    req.session.reqUrl = null; // Once we've used it, dump the value to null before the redirect.
  }
  res.redirect(redirectTo);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/farms");
  });
};
