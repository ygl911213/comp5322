const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout
router.get('/', checkLogin, function (req, res, next) {

  req.session.user = null
  req.flash('success', 'signout success!')

  res.redirect('/posts')
})

module.exports = router
