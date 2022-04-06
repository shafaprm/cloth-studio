const User = require('../models/user_model.js');

const checkCart = async(req, res, next) => {
    if(req.user.cart.length === 0){
        req.flash('error', 'It seems that your cart is empty.');
        res.redirect('/product')
    }
    next();
}

module.exports = checkCart;