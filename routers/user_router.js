const express = require("express");
const router = express.Router();
const passport = require("passport");
const userValidation = require("../validation/user_validation.js");
const User = require("../models/user_model.js");
const Item = require("../models/item_model.js");
const ExpressError = require("../utility/express_error.js");
const { isLogin, isNotLogin } = require("../utility/login_info.js");
const handleAsync = require("../utility/handle_async.js");
const checkCart = require('../utility/check_cart.js');

//User login
router.get("/login", isNotLogin, (req, res) => {
  res.render("users/login.ejs", {
    cssFile: "login",
  });
});

router.post(
  "/login",
  isNotLogin,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/product");
  }
);

//register
router.get("/register", isNotLogin, (req, res) => {
  res.render("users/register.ejs", {
    cssFile: "register",
  });
});

router.post(
  "/register",
  isNotLogin,
  userValidation,
  handleAsync(async (req, res) => {
    const { username, emailAddress, phoneNumber, homeAddress, province, district, city, zipCode } = req.body;
    if(phoneNumber.length !== 12 || phoneNumber[0] !== '0'){
      throw new ExpressError('Please enter a valid phone number')
    }
    const user = new User({ username, emailAddress, phoneNumber, homeAddress, province, district, city, zipCode });
    if(await User.findOne({emailAddress})){
      throw new ExpressError('User with the given email address is already exist');
    }
    await User.register(user, req.body.password, function (err) {
      if (err) {
        req.flash(err.message);
        throw new ExpressError(err);
      }
    });
    await user.save();
    req.login(user, function (err) {
      if (err) {
        throw new expressError(err);
      }
    });
    res.redirect("/product");
  })
);

//user information
router.get('', isLogin, async (req, res) => {
  const user = req.user;
  res.render('users/user_information', {cssFile : 'user_information', user});
})

//logout user
router.delete('/logout', isLogin, async(req, res) => {
  req.logout();
  res.redirect('/product');
})


//address page 
router.get('/address', isLogin, async(req, res) => {
  const user = req.user;
  res.render('users/address', {user, cssFile : 'address'});
})


//edit address router
router.get('/address/edit', isLogin, async(req, res) => {
  const user = req.user;
  res.render('users/address_edit', {user, cssFile : 'address_edit'});
})

router.post('/address/edit', isLogin, async(req, res) => {
  const user = req.user;
  const {homeAddress, province, district, city, zipCode, phoneNumber} = req.body
  user.homeAddress = homeAddress;
  user.province = province;
  user.district = district;
  user.city = city
  user.zipCode = zipCode
  user.phoneNumber = phoneNumber;

  await user.save();

  req.flash('success', 'Successfully changed your address')
  res.redirect('/user');
})

//personal info page
router.get('/personal-info', (req, res) => {
  const user = req.user;
  res.render('users/personal_info.ejs', {user, cssFile : 'personal_info'});
})

router.post('/personal-info', isLogin, async(req, res) => {
  const user = req.user;
  const {username, emailAddress, instagram, gender, profession} = req.body;
  user.username = username;
  user.email = emailAddress;
  user.instagram = instagram;
  user.gender = gender;
  user.profession = profession;
  
  await user.save();
  req.flash('success', 'Successfully changed your personal info')
  res.redirect('/user')
})

//wishlist page
router.get('/wishlist', isLogin, async(req, res) => {
  const user = await User.findById(req.user._id).populate({
    path : 'wishlist',
    populate : {
      path : 'product'
    }
  });
  res.render('users/wishlist.ejs', {user, cssFile : 'wishlist'})
})

//delete wishlist router
router.delete('/wishlist/:itemId', isLogin, async(req, res) => {
  const item = await Item.findById(req.params.itemId);
  const user = await User.findById(req.user._id).populate('wishlist')
  for(let i = 0; i < user.wishlist.length; i++){
    if(user.wishlist[i].name == item.name){
      user.wishlist.splice(i, 1)
      user.save()
    }
  }
  req.flash('success', 'Item is removed from the wishlist');
  res.redirect('/user/wishlist');
})

//user cart router
router.get('/cart', isLogin, async(req, res) => {
  const user = await User.findById(req.user._id).populate({
    path : 'cart',
    populate : {
      path : 'product'
    }
  });
  let total = 0;
  for(let item of user.cart){
    total += Number(item.product.price);
  }
  res.render('users/cart.ejs', {user, cssFile : 'cart', total});
})

//delete item in cart
router.delete('/cart/:itemId', isLogin, async(req,res ) => {
  const item = await Item.findById(req.params.itemId);
  const user = await User.findById(req.user._id).populate('cart')
  for(let i = 0; i < user.cart.length; i++){
    if(user.cart[i].name == item.name){
      user.cart.splice(i, 1)
      user.save()
    }
  }
  req.flash('success',  'Item is removed from the cart');
  res.redirect('/user/cart');
})

//render checkout
router.get('/checkout', checkCart, async(req, res) => {
  const user = await User.findById(req.user._id).populate({
    path : 'cart',
    populate : {
      path : 'product'
    }
  })
  let total = 0;
  for(let item of user.cart){
    total += Number(item.product.price);
  }
  res.render('users/checkout.ejs', {user, cssFile : 'checkout', total})
})

//handle checkout
router.post('/:userId/checkout', checkCart, isLogin, async(req, res) => {
  const user = await User.findById(req.user._id).populate('cart');
  for(let item of user.cart){
    let findItem = await Item.findById(item._id);
    findItem.stock--;
    await findItem.save();
  }
  user.cart = [];
  await user.save();
  req.flash('success', 'Your order is the package process, please wait until its arive at the destination!');
  res.redirect('/product')
})



router.get('/purchase-history', (req, res) => {
  throw new ExpressError('The page you are looking for is still in development stage');
})

router.get('/access-data', (req, res) => {
  throw new ExpressError('The page you are looking for is still in development stage');
})


module.exports = router;
