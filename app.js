if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/shopExplorer";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

const productsRoutes = require("./routes/products");
const farmsRoutes = require("./routes/farms");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");

const expressError = require("./utility/ExpressError");
const secret = process.env.SECRET || "mysecret";
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: secret,
  },
});

const sessionConfig = {
  store,
  name: "abracadabra",
  secret: secret,
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

app.use(passport.initialize());
app.use(passport.session()); // persist logIn
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success"); //avem mereu acces la succes sau ce nume vrem noi in templateuri
  res.locals.error = req.flash("error");
  next();
});

// ***************************************************************************************************************** //
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.use("/", usersRoutes);
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
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to Explorer Shop database...");
  })
  .catch((err) => {
    console.log("Eroare");
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
