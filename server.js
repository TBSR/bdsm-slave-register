const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const errorhandler = require('errorhandler')
const notifier = require('node-notifier')
const favicon = require('serve-favicon');
const moment = require('moment');
const path = require('path');
const SLRN = require('slrngen-js');
const SlaveRegisterValid = require('./scraper').SlaveRegister;
const png = require('./png').PNG;
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'))
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorhandler({log: errorNotification}))
}
app.use(favicon(__dirname + '/public/favicon.ico'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// Set port
app.set('port', process.env.PORT || 3000);

function errorNotification(err, str, req) {
  var title = 'Error in ' + req.method + ' ' + req.url

  notifier.notify({
    title: title,
    message: str
  })
}

function createPNG(code) {
  png(SLRN.defmt(code), path.resolve('./public/images'))
}

var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://slave:slaveme@ds025469.mlab.com:25469/slave-register';
var db;

MongoClient.connect(uristring, (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), () => {
    console.log('listening on ' + app.get('port'))
  })
})

app.get('/', (req, res) => {
 res.render('pages/index2')
})

app.get('/:id', (req, res) => {
  db.collection('slaves').findOne({ slave_id: req.params.id }, (err, item) => {
    if (err) return console.log(err)

    if (item) {
      res.render('pages/viewcert', {slave: item})
    } else {
      //TODO: check the current slaveregister.com to see if the record exist.
      SlaveRegisterValid(req.params.id, function(valid, data) {
        if (valid === 3) {
          console.log('message:add new: ' + data.message)
          res.render('pages/newinfo', {slave: data})
        } else if (valid === 2) {
            console.log('message:add existing: ' + data.message)
            res.render('pages/newinfo', {slave: data})
        }
        else {
          res.render('pages/error', {slave: data})
        }
      })
    }
  })
})

app.get('/:id/cert', (req, res) => {
  res.render('pages/error', {slave: {slave_id: req.params.id, message: 'Not implemented!'}})
})

app.post('/:id/register', (req, res) => {
  db.collection('slaves').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    console.log(req.body)
    createPNG(req.params.id)
    res.render('pages/viewcert', {slave: req.body})
  })
})

app.get('/i/register', (req, res) => {
  var id = SLRN.create();
  var newID = SLRN.fmt(id);
  //TODO: check number if already exist in slaveregister.com and or fetlife.com
  SlaveRegisterValid(newID, function(valid, data) {
    if (valid === 3) {
      console.log('message:register ' + data.message)
      res.render('pages/newinfo', {slave: data})
    }
    else {
      res.render('pages/error', {slave: data})
    }
  })
})

app.get('/i/about', (req, res) => {
  res.render('pages/error', {slave: {message: 'Not implemented!'}})
})
//app.get('/', (req, res) => {
//  db.collection('quotes').find().toArray((err, result) => {
//    if (err) return console.log(err)
    // renders index.ejs
//    res.render('index.ejs', {quotes: result})
//  })
//})

app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/quotes', (req, res) => {
  db.collection('quotes').findOneAndUpdate({name: 'Yoda'}, {
    $set: {
      name: req.body.name,
      quote: req.body.quote
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    console.log('Darth Vader updated Yodas quote.')
    res.send(result)
  })
})

app.delete('/quotes', (req, res) => {
  db.collection('quotes').findOneAndDelete({name: req.body.name},
  (err, result) => {
    if (err) return res.send(500, err)
    console.log('Darth Vader quote deleted.')
    //res.send('A darth vadar quote got deleted')
    res.send(result)
  })
})
