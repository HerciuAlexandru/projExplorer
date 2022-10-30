const express = require("express");
const path = require("path");
const port = 3000;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const categories = ["fruits", "vegetables"];

const expressError = require("./utility/ExpressError");
const catchAsync = require("./utility/CatchAsync");

const mongoose = require("mongoose");
const Product = require("./models/product");

// *************************************************************************************************************** //
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true })); // parsare body

// ***************************************************************************************************************** //
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get(
  "/products",
  catchAsync(async (req, res) => {
    const { category } = req.query;
    if (category) {
      const products = await Product.find({ category });
      res.render("products/index.ejs", { products, category });
    } else {
      const products = await Product.find({});
      res.render("products/index.ejs", { products, category: "All" });
    }
  })
);

app.get("/products/new", (req, res) => {
  res.render("products/new.ejs", { categories });
});

app.post(
  "/products",
  catchAsync(async (req, res, next) => {
    const product = new Product(req.body.product);
    await product.save();
    res.redirect(`/products/${product._id}`);
  })
);

app.get(
  "/products/:id",
  catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    res.render("products/show.ejs", { product });
  })
);

app.get(
  "/products/:id/edit",
  catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render("products/edit.ejs", { product, categories });
  })
);

app.put(
  "/products/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, {
      ...req.body.product,
    });
    res.redirect(`/products/${product._id}`);
  })
);

app.delete(
  "/products/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect("/products");
  })
);

app.all("*", (req, res, next) => {
  next(new expressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// ***************************************************************************************************************** //
mongoose
  .connect("mongodb://localhost:27017/shopExplorer")
  .then(() => {
    console.log("Connected to Explorer Shop database...");
  })
  .catch((err) => {
    console.log("Eroare");
    console.log(err);
  });

app.listen(port, () => {
  console.log("Listening on port 3000...");
});
