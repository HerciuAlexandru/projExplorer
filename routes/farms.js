const express = require("express");
const router = express.Router();
const farms = require("../controllers/farms");

const { isLoggedIn, isAdmin } = require("../utility/middleware");
const catchAsync = require("../utility/CatchAsync");

router.get("/", farms.index);

router.get("/new", isLoggedIn, farms.renderNewForm);

router.post("/", isLoggedIn, catchAsync(farms.createFarm));

router.get("/:id", catchAsync(farms.showFarm));

router.get("/:id/edit", isLoggedIn, isAdmin, catchAsync(farms.renderEditForm));

router.put("/:id", isLoggedIn, isAdmin, catchAsync(farms.updateFarm));

router.get("/:id/products/new", isLoggedIn, farms.renderFarmProductsForm);

router.post("/:id/products", farms.newFarmProduct);

router.delete("/:id", isLoggedIn, isAdmin, catchAsync(farms.deleteFarm));

module.exports = router;
