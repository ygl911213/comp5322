const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')


router.get('/', function (req, res, next) {
  const author = req.query.author

  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next)
})


router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  //
  try {
    if (!title.length) {
      throw new Error('Please enter a Title')
    }
    if (!content.length) {
      throw new Error('Please enter the content')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  }

  PostModel.create(post)
    .then(function (result) {

      post = result.ops[0]
      req.flash('success', 'Submit success!')
      //
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/:postId
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId

  Promise.all([
    PostModel.getPostById(postId), //
    CommentModel.getComments(postId), //
    PostModel.incPv(postId)//
  ])
    .then(function (result) {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('Article not exist!')
      }

      res.render('post', {
        post: post,
        comments: comments
      })
    })
    .catch(next)
})

// GET /posts/:postId/edit
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('Article not exist!')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('Insufficient permissions!')
      }
      res.render('edit', {
        post: post
      })
    })
    .catch(next)
})

// POST /posts/:postId/edit
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('\'Please enter a Title')
    }
    if (!content.length) {
      throw new Error('\'Please enter the content')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('Article not exist!')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('Insufficient permissions!')
      }

      PostModel.updatePostById(postId, { title: title, content: content })
        .then(function () {
          req.flash('success', 'Update success!')
          //
          res.redirect(`/posts/${postId}`)
        })
        .catch(next)
    })
})

// GET /posts/:postId/remove
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('Article not exist!')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('Insufficient permissions!')
      }
      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success', 'Delete success')

          res.redirect('/posts')
        })
        .catch(next)
    })
})

module.exports = router
