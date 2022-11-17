const categories = ["fruits", "vegetables"];
const Farm = require("../models/farm");
const Product = require("../models/product");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  console.log(req.query);
  if (category) {
    const products = await Product.find({ category });
    res.render("products/index.ejs", { products, category });
  } else {
    const products = await Product.find({}).populate("farm");
    res.render("products/index.ejs", {
      products,
      category: "All",
    });
  }
};

module.exports.renderNewForm = async (req, res) => {
  const farm = await Farm.find();
  res.render("products/new.ejs", { categories, farm });
};

module.exports.createProduct = async (req, res, next) => {
  const product = new Product(req.body.product);
  await product.save();
  res.redirect(`/products/${product._id}`);
};

module.exports.showProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("farm");
  if (!product) {
    req.flash("error", "Cannot find that product");
    return res.redirect("/products");
  }
  res.render("products/show.ejs", { product });
};

module.exports.renderEditProdForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render("products/edit.ejs", { product, categories });
};

module.exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, {
    ...req.body.product,
  });
  res.redirect(`/products/${product._id}`);
};

module.exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.redirect("/products");
};
