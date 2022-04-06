const mongoose = require("mongoose");
const db = mongoose.connection;
const User = require("../models/user_model.js");
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const URI = process.env.URI;

mongoose.connect(URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

db.on("error", () =>
  console.log("Mongoose failed to connect to mongodb database")
);
db.once("open", () => console.log("Mongose connected to mongodb database"));

async function createAdmin(userId) {
  console.log('It hit the function')
  const user = await User.findById(userId);
  user.isAdmin = true;
  await user.save();

  console.log(`${user.username} is now an admin!`);
}

createAdmin("624d34b8a382974cdb0ae8ee");
