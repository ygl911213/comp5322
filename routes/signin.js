const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signin
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signin')
})

// POST /signin
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const password = req.fields.password

  //
  try {
    if (!name.length) {
      throw new Error('Please enter the username')
    }
    if (!password.length) {
      throw new Error('Please enter the password')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', 'user not exsit')
        return res.redirect('back')
      }
      //
      if (sha1(password) !== user.password) {
        req.flash('error', 'wrong username or password')
        return res.redirect('back')
      }
      req.flash('success', 'Sign in succeed')
      //  session
      delete user.password
      req.session.user = user
      //
      res.redirect('/posts')
    })
    .catch(next)
})

module.exports = router
