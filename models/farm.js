const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./product");
const Review = require("./review");
const farmSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  email: {
    type: String,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
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
