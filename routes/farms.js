const express = require("express");
const router = express.Router();
const expressError = require("../utility/ExpressError");
const catchAsync = require("../utility/CatchAsync");
const Farm = require("../models/farm");
const Product = require("../models/product");

router.get("/", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

router.get("/new", async (req, res) => {
  res.render("farms/new.ejs");
});

router.post("/", async (req, res) => {
  const farm = new Farm(req.body.farm);
  await farm.save();
  req.flash("success", "Successfully made a new farm");
  res.redirect(`/farms/${farm._id}`);
});

router.get("/:id", async (req, res) => {
  const farm = await Farm.findById(req.params.id)
    .populate("products")
    .populate("reviews");
  if (!farm) {
    req.flash("error", "Cannot find that farm");
    return res.redirect("/farms");
  }
  res.render("farms/show.ejs", { farm });
});

router.get(
  "/:id/edit",
  catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    res.render("farms/edit.ejs", { farm });
  })
);

router.put(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findByIdAndUpdate(id, {
      ...req.body.farm,
    });
    req.flash("success", "Successfully updated farm");
    res.redirect(`/farms/${farm._id}`);
  })
);

router.get("/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});

router.post("/:id/products", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const product = new Product(req.body.product);
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();
  res.redirect(`/farms/${farm._id}`);
});

router.delete("/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted farm");
  res.redirect("/farms");
});

module.exports = router;
