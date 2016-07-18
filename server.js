/* eslint camelcase: ["error", {properties: "never"}] */

const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorhandler = require('errorhandler');
// const notifier = require('node-notifier');
const favicon = require('serve-favicon');
const path = require('path');
const slrn = require('slrngen-js');
const slaveRegisterValid = require('./scraper').SlaveRegister;
const png = require('./png').PNG;
const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler({log: errorNotification}));
}
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
// Set port
app.set('port', process.env.PORT || 3000);

function errorNotification(err, str, req) {
  var title = 'Error in ' + req.method + ' ' + req.url + ': ' + err;
  console.log(title);
  /* notifier.notify({
    title: title,
    message: str
  }); */
}

function createPNG(code) {
  png(slrn.defmt(code), path.resolve('./public/images'));
}

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://slave:slaveme@ds025469.mlab.com:25469/slave-register';
var db;

MongoClient.connect(uristring, (err, database) => {
  if (err) {
    return console.log(err);
  }
  db = database;
  app.listen(app.get('port'), () => {
    console.log('listening on ' + app.get('port'));
  });
});

app.get('/', (req, res) => {
  res.render('pages/index2');
});

app.get('/:id', (req, res) => {
  db.collection('slaves').findOne({slave_id: req.params.id}, (err, item) => {
    if (err) {
      return console.log(err);
    }

    if (item) {
      res.render('pages/viewcert', {slave: item});
    } else {
      slaveRegisterValid(req.params.id, function (valid, data) {
        if (valid === 3) {
          console.log('message:add new: ' + data.message);
          res.render('pages/newinfo', {slave: data});
        } else if (valid === 2) {
          console.log('message:add existing: ' + data.message);
          res.render('pages/newinfo', {slave: data});
        } else {
          res.render('pages/error', {slave: data});
        }
      });
    }
  });
});

app.get('/:id/cert', (req, res) => {
  res.render('pages/error', {slave: {slave_id: req.params.id, message: 'Not implemented!'}});
});

app.post('/:id/register', (req, res) => {
  db.collection('slaves').save(req.body, (err, result) => {
    if (err) {
      return console.log(err);
    }
    console.log('saved to database');
    console.log(req.body);
    console.log(result);
    createPNG(req.params.id);
    res.render('pages/viewcert', {slave: req.body});
  });
});

app.get('/i/register', (req, res) => {
  var id = slrn.create();
  var newID = slrn.fmt(id);
  slaveRegisterValid(newID, function (valid, data) {
    if (valid === 3) {
      console.log('message:register ' + data.message);
      res.render('pages/newinfo', {slave: data});
    } else {
      res.render('pages/error', {slave: data});
    }
  });
});

app.get('/i/about', (req, res) => {
  res.render('pages/error', {slave: {message: 'Not implemented!'}});
});
