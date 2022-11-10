const Farm = require("../models/farm");
const Product = require("../models/product");
const cloudinary = require("cloudinary").v2;

const categories = ["fruits", "vegetables"];

module.exports.index = async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
};

module.exports.renderNewForm = async (req, res) => {
  res.render("farms/new.ejs");
};

module.exports.createFarm = async (req, res) => {
  const farm = new Farm(req.body.farm);
  farm.image = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  farm.admin = req.user._id;
  await farm.save();
  console.log(farm);
  console.log(`New farm here: ${farm}`);
  req.flash("success", "Successfully made a new farm");
  res.redirect(`/farms/${farm._id}`);
};

module.exports.showFarm = async (req, res) => {
  const farm = await Farm.findById(req.params.id)
    .populate("products")
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("admin");
  if (!farm) {
    req.flash("error", "Cannot find that farm");
    return res.redirect("/farms");
  }
  res.render("farms/show.ejs", { farm });
};

module.exports.renderEditForm = async (req, res) => {
  const farm = await Farm.findById(req.params.id);
  res.render("farms/edit.ejs", { farm });
};

module.exports.updateFarm = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const farm = await Farm.findByIdAndUpdate(id, { ...req.body.farm });
  const imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  farm.image.push(...imgs);
  await farm.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename); //delete cloudinary
    }
    await farm.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } }, //delete db
    });
    console.log(farm);
  }

  req.flash("success", "Successfully updated farm");
  res.redirect(`/farms/${farm._id}`);
};

module.exports.renderFarmProductsForm = async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
};

module.exports.newFarmProduct = async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const product = new Product(req.body.product);
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();
  res.redirect(`/farms/${farm._id}`);
};

module.exports.deleteFarm = async (req, res) => {
  await Farm.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted farm");
  res.redirect("/farms");
};
