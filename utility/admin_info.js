async function isAdmin(req, res, next) {
  if (req.user.isAdmin !== true){
    res.redirect('/product')
  }

  next();
}

module.exports = isAdmin;
