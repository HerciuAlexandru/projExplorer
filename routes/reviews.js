const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const catchAsync = require("../utility/CatchAsync");
const Farm = require("../models/farm");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../utility/middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    farm.reviews.push(review);
    await review.save();
    await farm.save();
    req.flash("success", "New review here");
    res.redirect(`/farms/${farm._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
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
