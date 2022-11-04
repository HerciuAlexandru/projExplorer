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
const { reviewSchema } = require("./schemas.js");
const Farm = require("./models/farm");
const Product = require("./models/product");
const Review = require("./models/review");
const ExpressError = require("./utility/ExpressError");

// *************************************************************************************************************** //
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ***************************************************************************************************************** //

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
// ***************************************************************************************************************** //

app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

app.get("/farms/new", async (req, res) => {
  res.render("farms/new.ejs");
});

app.post("/farms", async (req, res) => {
  const newFarm = new Farm(req.body.farm);
  await newFarm.save();
  res.redirect("/farms");
});

app.get("/farms/:id", async (req, res) => {
  const farm = await Farm.findById(req.params.id)
    .populate("products")
    .populate("reviews");
  res.render("farms/show.ejs", { farm });
});

app.get(
  "/farms/:id/edit",
  catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    res.render("farms/edit.ejs", { farm });
  })
);

app.put(
  "/farms/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findByIdAndUpdate(id, {
      ...req.body.farm,
    });
    res.redirect(`/farms/${farm._id}`);
  })
);

app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});

app.post("/farms/:id/products", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const product = new Product(req.body.product);
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();
  res.redirect(`/farms/${farm._id}`);
});

app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/farms");
});

app.post(
  "/farms/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id);
    const review = new Review(req.body.review);
    farm.reviews.push(review);
    await review.save();
    await farm.save();
    res.redirect(`/farms/${farm._id}`);
  })
);

app.delete(
  "/farms/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const farm = await Farm.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/farms/${id}`);
  })
);
//  href="/farms/<%= farm.id %>/edit">Edit</a>
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
      const products = await Product.find({}).populate("farm");
      res.render("products/index.ejs", {
        products,
        category: "All",
      });
    }
  })
);

app.get("/products/new", async (req, res) => {
  const farm = await Farm.find();
  res.render("products/new.ejs", { categories, farm });
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
    const product = await Product.findById(req.params.id).populate("farm");
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
