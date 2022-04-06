const mongoose = require("mongoose");
const { Schema } = mongoose;
const Item = require("./item_model.js");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    material: {
      type: String,
      required: true,
      lowercase: true,
    },
    feature: [
      {
        type: String,
        lowercase: true,
      },
    ],
    price: {
      type: String,
      required: true,
    },
    images: [
      {
        path: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
