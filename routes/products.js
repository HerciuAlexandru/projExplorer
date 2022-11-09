const express = require("express");
const router = express.Router();
const Farm = require("../models/farm");
const Product = require("../models/product");
const products = require("../controllers/products");

const catchAsync = require("../utility/CatchAsync");

router.get("/", catchAsync(products.index));

router.get("/new", products.renderNewForm);

router.post("/", catchAsync(products.createProduct));

router.get("/:id", catchAsync(products.showProduct));

router.get("/:id/edit", catchAsync(products.renderEditProdForm));

router.put("/:id", catchAsync(products.updateProduct));

router.delete("/:id", catchAsync(products.deleteProduct));

module.exports = router;
