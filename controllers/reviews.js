const Review = require("../models/review");
const Farm = require("../models/farm");

module.exports.createReviews = async (req, res) => {
  const farm = await Farm.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  farm.reviews.push(review);
  await review.save();
  await farm.save();
  req.flash("success", "New review here");
  res.redirect(`/farms/${farm._id}`);
};

module.exports.deleteReviews = async (req, res) => {
  const { id, reviewId } = req.params;
  const farm = await Farm.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  const review = await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/farms/${id}`);
};
