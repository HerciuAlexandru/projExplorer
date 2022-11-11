const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./product");
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const farmSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  geometry: {
    type: {
      type: [String],
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  location: {
    type: String,
  },
  image: [ImageSchema],
  email: {
    type: String,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.reviews.length) {
    const res = await Review.deleteMany({ _id: { $in: farm.reviews } });
    console.log(res);
  }
});

farmSchema.post("findOneAndDelete", async function (farm) {
  if (farm.products.length) {
    const res = await Product.deleteMany({ _id: { $in: farm.products } });
    console.log(res);
  }
});

const Farm = mongoose.model("Farm", farmSchema);

module.exports = Farm;
