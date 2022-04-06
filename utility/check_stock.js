const Item = require('../models/item_model.js');

const checkStock = async (req, res, next) => {
    const item = await Item.findById(req.params.itemId);
    if(item.stock < 1){
        req.flash('error', 'This item is sold out');
        res.redirect('/product');
    }
    console.log(`The stock is ${item.stock}`)
    next();
}

module.exports = checkStock;