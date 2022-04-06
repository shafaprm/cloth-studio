const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const Item = require('./item_model.js');

const userSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    required: true,
  },
  emailAddress: {
    type: String,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  homeAddress: { 
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true,
  },
  province : {
    type : String,
    lowercase : true,
    required : true
  },
  district : {
    type : String,
    lowercase : true,
    required : true
  },
  city : {
    type : String,
    lowercase : true,
    required : true,
  },
  zipCode : {
    type : Number,
    required : true
  },
  wishlist : [{
    type : Schema.Types.ObjectId,
    ref : 'Item',
  }],
  instagram : {
    type : String,
    lowercase : true,
  },
  gender : {
    type : String,
    lowercase : true,
  },
  profession : {
    type : String,
    lowercase : true,
  },
  cart : [
    {
      type : Schema.Types.ObjectId,
      ref : 'Item',
    }
  ]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
