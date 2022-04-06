const mongoose = require("mongoose");
const { Schema } = mongoose;
const Product = require("./product_model.js");

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  color: {
    type: String,
    required: true,
    lowercase: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  images: [
    {
      filename: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
    },
  ],
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
