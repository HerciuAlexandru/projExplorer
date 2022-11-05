const express = require("express");
const router = express.Router();
const Farm = require("../models/farm");
const Product = require("../models/product");

const expressError = require("../utility/ExpressError");
const catchAsync = require("../utility/CatchAsync");

const categories = ["fruits", "vegetables"];

router.get(
  "/",
  catchAsync(async (req, res) => {
    const { category } = req.query;
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
  })
);

router.get("/new", async (req, res) => {
  const farm = await Farm.find();
  res.render("products/new.ejs", { categories, farm });
});

router.post(
  "/",
  catchAsync(async (req, res, next) => {
    const product = new Product(req.body.product);
    await product.save();
    res.redirect(`/products/${product._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("farm");
    if (!product) {
      req.flash("error", "Cannot find that product");
      return res.redirect("/products");
    }
    res.render("products/show.ejs", { product });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/edit.ejs", { product, categories });
  })
);

router.put(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, {
      ...req.body.product,
    });
    res.redirect(`/products/${product._id}`);
  })
);

router.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect("/products");
  })
);

module.exports = router;
