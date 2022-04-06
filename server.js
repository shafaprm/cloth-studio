const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const db = mongoose.connection;
const userRouter = require("./routers/user_router.js");
const productRouter = require("./routers/product_router.js");
const session = require("express-session");
const User = require("./models/user_model.js");
const localStrategy = require("passport-local");
const passport = require("passport");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const sanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const sanitizeHtml = require('sanitize-html');
const dirty = 'some really tacky HTML';
const clean = sanitizeHtml(dirty, {
  allowedTags : [],
  allowedAttributes : {},
});
const mongoDb = require('mongodb')


if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const URI = process.env.URI;
mongoose.connect(URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

db.on("error", () =>
  console.log("Mongoose failed to connect to mongodb database")
);
db.once("open", () => console.log("Mongoose connected to mongodb database"));

app.engine('ejs', engine)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());


app.use(
  session({
    secret: "session>cookie",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: URI,
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  if (req.user && req.user.isAdmin === true) {
    res.locals.admin = req.user;
  }
  if(!['/user/login', '/user/register', '/user/logout', '/user/personal-info', '/user/address-edit'].includes(req.originalUrl)){
    res.locals.returnTo = req.originalUrl;
  }

  res.locals.flashError = req.flash("error");
  res.locals.flashSuccess = req.flash("success");

  next();
});

//routers
app.use("/user", userRouter);
app.use("/product", productRouter);

app.use((err, req, res, next) => {
  req.flash("error", err.message);
  res.redirect("/product");
 
  //console logging error on production fase
  console.log(err); 
  next();
});

app.get('*', (req, res) => {
  res.redirect('/product');
})


app.listen(3000, () => console.log("Listening on port 3000", URI));
