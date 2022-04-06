const express = require("express");
const router = express.Router();
const { isLogin, isNotLogin } = require("../utility/login_info.js");
const isAdmin = require("../utility/admin_info.js");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary/index.js");
const upload = multer({ storage });
const Product = require("../models/product_model.js");
const Item = require("../models/item_model.js");
const User = require('../models/user_model.js')
const handleAsync = require("../utility/handle_async.js");
const ExpressError = require("../utility/express_error.js");
const checkStock = require('../utility/check_stock.js');

//get all product
router.get("", async (req, res) => {
  const products = await Product.find().populate('items');
  res.render('products/all_products.ejs', {products, cssFile : 'all_product'});
});

//create product/item
router.get("/admin/new", (req, res) => {
  res.render("products/new.ejs", { cssFile: "new" });
});

//handle create product
router.post(
  "/admin/new-product",
  upload.array("images", 2),
  handleAsync(async (req, res) => {
    const { name, material, price } = req.body;
    const images = [];
    console.log(req.files);
    for (let image of req.files) {
      images.push({
        path: image.path,
        filename: image.filename,
      });
    }
    const feature = req.body.feature.split("-");
    const product = new Product({
      name,
      material,
      price,
      feature,
      images,
    });
    await product.save();
    res.redirect("/product");
  })
);

//handle create item
router.post(
  "/admin/new-item",
  upload.array("item-images", 3),
  handleAsync(async (req, res) => {
    const { product, name, color, stock } = req.body;
    let findProduct = await Product.findOne({ name: product });

    if (!findProduct) {
      for(let image of req.files){
        cloudinary.uploader.destroy(image.filename);
      }
      throw new ExpressError(`Product name ${product} is not found!`);
    }

    const images = [];
    for (let image of req.files) {
      images.push({
        filename: image.filename,
        path: image.path,
      });
    }

    const item = new Item({
      name,
      color,
      stock,
      images: images,
      product: findProduct._id,
    });

    findProduct.items.push(item._id);

    await item.save();
    await findProduct.save();
    res.redirect("/product");
  })
);

//about page
router.get('/about', (req, res) => {
  throw new ExpressError('The page you are looking for is still in development stage');
})

//each item page
router.get('/:itemId', async(req, res) => {
  const item = await Item.findById(req.params.itemId).populate('product')
  res.render('products/item.ejs', {item, cssFile : 'item'});
})


//handle add to cart form/button
router.post('/:itemId', checkStock, isLogin, async(req, res) => {
  const item = await Item.findById(req.params.itemId);
  const user = await User.findById(req.user._id).populate('cart');
  for(let element of user.cart){
    if(element.name == item.name){
      req.flash('error', 'This item is already in your cart')
      res.redirect(`/product/${item._id}`);
      return;
    }
  }
  user.cart.push(item);
  await user.save()
  req.flash('success', 'Item is added to your cart')
  res.redirect(`/product/${item._id}`);
})

//handle add to wishlist
router.post('/:itemId/wishlist', checkStock, isLogin, async(req, res) => {
  const item = await Item.findById(req.params.itemId);
  const user = await User.findById(req.user._id).populate('wishlist');
  for(let element of user.wishlist){
    if(element.name == item.name){
      req.flash('error', 'This item is already in your wishlist')
      res.redirect(`/product/${item._id}`);
      return;
    }
  }

  user.wishlist.push(item);
  await user.save();
  req.flash('success', 'Item is added to your wishlist')
  res.redirect(`/product/${item._id}`);

})



module.exports = router;
