const Joi = require("joi");

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required(),
    body: Joi.string().required(),
  }).required(),
});

module.exports.farmSchema = Joi.object({
  farm: Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    // image: Joi.string().required(),
    email: Joi.string().required(),
  }).required(),
  deleteImages: Joi.array(),
});
