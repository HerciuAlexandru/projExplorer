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
  image: {
    type: String,
  },
  category: {
    type: String,
    enum: ["fruits", "vegetables"],
  },

  location: String,
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
