const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");

const expressError = require("../utility/ExpressError");
const catchAsync = require("../utility/CatchAsync");
const Farm = require("../models/farm");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    const review = new Review(req.body.review);
    farm.reviews.push(review);
    await review.save();
    await farm.save();
    req.flash("success", "New review here");
    res.redirect(`/farms/${farm._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const farm = await Farm.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/farms/${id}`);
  })
);

module.exports = router;
