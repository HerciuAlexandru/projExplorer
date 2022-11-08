const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utility/CatchAsync");
const reviews = require("../controllers/reviews");

const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../utility/middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReviews));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReviews)
);

module.exports = router;
