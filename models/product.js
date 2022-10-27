const mongoose = require("mongoose");
const Schema = mongoose.Schema; // shortcut

const ProductSchema = new Schema({
  name: {
    type: String,
  },
  price: {
    type: Number,
    min: 0,
  },
  category: {
    type: String,
    enum: ["fruit", "vegetable"],
  },

  location: String,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
