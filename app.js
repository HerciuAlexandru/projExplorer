const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");

const productsRoutes = require("./routes/products");
const farmsRoutes = require("./routes/farms");
const reviewsRoutes = require("./routes/reviews");

const expressError = require("./utility/ExpressError");
const sessionConfig = {
  secret: "mysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1w
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
// *************************************************************************************************************** //
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //avem mereu acces la succes sau ce nume vrem noi in templateuri
  res.locals.error = req.flash("error");
  next();
});

// ***************************************************************************************************************** //
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.use("/products", productsRoutes);
app.use("/farms", farmsRoutes);
app.use("/farms/:id/reviews", reviewsRoutes);

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
