const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utility/CatchAsync");
const passport = require("passport");
const { isLoggedIn } = require("../utility/middleware");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
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
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back !");
    let redirectTo = "/farms"; // Set default redirect value
    if (req.session.reqUrl) {
      redirectTo = req.session.reqUrl; // If our redirect value exists in the session, use that.
      req.session.reqUrl = null; // Once we've used it, dump the value to null before the redirect.
    }
    res.redirect(redirectTo);
  } 
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/farms");
  });
});

module.exports = router;
