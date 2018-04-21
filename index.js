const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')

const app = express()
var port = process.env.PORT || 8000

app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'ejs')


app.use(express.static(path.join(__dirname, 'public')))
// session
app.use(session({
  name: config.session.key, //
  secret: config.session.secret, //
  resave: true, //
  saveUninitialized: false, //
  cookie: {
    maxAge: config.session.maxAge//
  },
  store: new MongoStore({//
    url: config.mongodb//
  })
}))
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'), //
  keepExtensions: true
}))
// flash
app.use(flash())
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}


app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

routes(app)

//
server.listen(port, function() {
    console.log("App is running on port " + port);
});
