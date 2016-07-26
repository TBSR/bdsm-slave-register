/* eslint camelcase: ["error", {properties: "never"}] */

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
// var notifier = require('node-notifier');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var account = require('./models/account');
var app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(session({
  secret: 'dobie',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler({log: errorNotification}));
}
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
// Set port
app.set('port', process.env.PORT || 3000);

app.use('/', routes);
app.listen(app.get('port'), () => {
  console.log('listening on ' + app.get('port'));
});

// passport config
passport.use(new LocalStrategy(account.authenticate()));
passport.serializeUser(account.serializeUser());
passport.deserializeUser(account.deserializeUser());

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://slave:slaveme@ds025469.mlab.com:25469/slave-register';

// mongoose
mongoose.connect(uristring);

function errorNotification(err, str, req) {
  var title = 'Error in ' + req.method + ' ' + req.url + ': ' + err;
  console.log(title);
  /* notifier.notify({
    title: title,
    message: str
  }); */
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('pages/error', {user: req.user, slave: {message: err.message, error: err}});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('pages/error', {user: req.user, slave: {message: err.message, error: {}}});
});

module.exports = app;
