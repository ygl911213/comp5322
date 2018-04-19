const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup')
})

// POST /signup
router.post('/', checkNotLogin, function (req, res, next) {
  const name = req.fields.name
  const gender = req.fields.gender
  const bio = req.fields.bio
  const avatar = req.files.avatar.path.split(path.sep).pop()
  let password = req.fields.password
  const repassword = req.fields.repassword

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('1-10bits')
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('gender only m、f ot x')
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('limited 1-30bits')
    }
    if (!req.files.avatar.name) {
      throw new Error('need an image')
    }
    if (password.length < 6) {
      throw new Error('password at least 6bits')
    }
    if (password !== repassword) {
      throw new Error('different password')
    }
  } catch (e) {

    fs.unlink(req.files.avatar.path)
    req.flash('error', e.message)
    return res.redirect('/signup')
  }


  password = sha1(password)


  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }

  UserModel.create(user)
    .then(function (result) {

      user = result.ops[0]

      delete user.password
      req.session.user = user

      req.flash('success', 'sign up success')

      res.redirect('/posts')
    })
    .catch(function (e) {

      fs.unlink(req.files.avatar.path)

      if (e.message.match('duplicate key')) {
        req.flash('error', 'username has benn occupied')
        return res.redirect('/signup')
      }
      next(e)
    })
})

module.exports = router
