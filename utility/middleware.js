const Farm = require("../models/farm");
const { reviewSchema, farmSchema } = require("../schemas");
const expressError = require("../utility/ExpressError");
const Review = require("../models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.reqUrl = req.originalUrl;
    req.flash("error", "You must be signed in !");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAdmin = async (req, res, next) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  if (!farm.admin.equals(req.user._id)) {
    req.flash("error", "You dont have permission");
    return res.redirect(`/farms/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You dont have permission");
    return res.redirect(`/farms/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateFarm = (req, res, next) => {
  const { error } = farmSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};
