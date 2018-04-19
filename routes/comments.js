const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

// POST /comments
router.post('/', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const postId = req.fields.postId
  const content = req.fields.content

  // 校验参数
  try {
    if (!content.length) {
      throw new Error('Please enter the comments')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author: author,
    postId: postId,
    content: content
  }

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', 'comment success')
      //
      res.redirect('back')
    })
    .catch(next)
})

// GET /comments/:commentId/remove
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
  const commentId = req.params.commentId
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      if (!comment) {
        throw new Error('Comments not exist')
      }
      if (comment.author.toString() !== author.toString()) {
        throw new Error('Insufficient permissions')
      }
      CommentModel.delCommentById(commentId)
        .then(function () {
          req.flash('success', 'Delete success')
          //
          res.redirect('back')
        })
        .catch(next)
    })
})

module.exports = router
