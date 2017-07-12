/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint new-cap: [0] */
/* eslint max-nested-callbacks: ["error", 6] */
/* eslint-disable-line  max-lines */

var express = require('express');
var passport = require('passport');
var path = require('path');
var SGen = require('node-sgen');
var slaveRegisterValid = require('../scraper').SlaveRegister;
var pngimg = require('../png').GeneratePng;
// var verify = require('../recaptcha').Verify;
var Account = require('../models/account');
var Slave = require('../models/slave');
var OwnerType = require('../models/ownertype');
var OwnedMonth = require('../models/ownedmonth');
var OwnedDateType = require('../models/owneddatetype');
var router = express.Router();
var sgen = SGen();

function createPNG(code) {
  pngimg(sgen.defmt(code), path.resolve('./public'), function (err) {
    if (err) {
      console.log(err);
      return false;
    }
  });
  return true;
}

function fileExists(file) {
  var fs = require('fs');
  fs.access(file, fs.F_OK, function (err) {
    if (err) {
      return false;
    }
    return true;
  });
}

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/p/login');
  }
}

function ownercb(err, item) {
  if (err) {
    return console.error(err);
  }
  console.dir(item);
}

function loadData() {
  OwnerType.find({}, (err, owner) => {
    if (err) {
      return console.log(err);
    }
    if (owner.length) {
      console.log('OwnerType is already loaded');
    } else {
      new OwnerType({value: 10, text: 'free and unowned'}).save(ownercb);
      new OwnerType({value: 11, text: 'owned slave'}).save(ownercb);
      new OwnerType({value: 12, text: 'collared submissive'}).save(ownercb);
      new OwnerType({value: 13, text: 'owned property'}).save(ownercb);
      new OwnerType({value: 14, text: 'submissive in sevice'}).save(ownercb);
      new OwnerType({value: 15, text: 'servant in service'}).save(ownercb);
      new OwnerType({value: 16, text: 'submissive in training'}).save(ownercb);
    }
  });
  OwnedMonth.find({}, (err, owned) => {
    if (err) {
      return console.log(err);
    }
    if (owned.length) {
      console.log('OwnedMonth is already loaded');
    } else {
      new OwnedMonth({value: 50, text: ''}).save(ownercb);
      new OwnedMonth({value: 51, text: 'January'}).save(ownercb);
      new OwnedMonth({value: 52, text: 'February'}).save(ownercb);
      new OwnedMonth({value: 53, text: 'March'}).save(ownercb);
      new OwnedMonth({value: 54, text: 'April'}).save(ownercb);
      new OwnedMonth({value: 55, text: 'May'}).save(ownercb);
      new OwnedMonth({value: 56, text: 'June'}).save(ownercb);
      new OwnedMonth({value: 57, text: 'July'}).save(ownercb);
      new OwnedMonth({value: 58, text: 'August'}).save(ownercb);
      new OwnedMonth({value: 59, text: 'September'}).save(ownercb);
      new OwnedMonth({value: 60, text: 'October'}).save(ownercb);
      new OwnedMonth({value: 61, text: 'November'}).save(ownercb);
      new OwnedMonth({value: 62, text: 'December'}).save(ownercb);
    }
  });
  OwnedDateType.find({}, (err, owned) => {
    if (err) {
      return console.log(err);
    }
    if (owned.length) {
      console.log('OwnedDateType is already loaded');
    } else {
      new OwnedDateType({value: 63, text: ''}).save(ownercb);
      new OwnedDateType({value: 64, text: 'in service'}).save(ownercb);
      new OwnedDateType({value: 65, text: 'owned by'}).save(ownercb);
      new OwnedDateType({value: 66, text: 'collared to'}).save(ownercb);
      new OwnedDateType({value: 67, text: 'being trained'}).save(ownercb);
    }
  });
}

function getCollectionResult(call, callback) {
  // Query the collection
  call.find({active: true}).sort({value: 1}).exec(function (err, result) {
    if (err) {
      console.log(err);
    } else if (result.length) {
      // console.log('Found:', result);
    } else {
      console.log('No document(s) found with defined "find" criteria!');
    }
    callback(err, result);
  });
}

router.get('/', (req, res) => {
  loadData();
  res.render('pages/index', {slave: {}});
});

router.get('/:id', loggedIn, (req, res) => {
  Slave.findOne({slave_id: req.params.id}, (err, slave) => {
    if (err) {
      return console.log(err);
    }

    if (slave) {
      if (!fileExists(path.resolve('./public/images/' + req.params.id + '.png'))) {
        createPNG(req.params.id);
      }
      res.render('pages/viewcert', {user: req.user, slave: slave});
    } else {
      slaveRegisterValid(req.params.id, function (valid, data) {
        res.render('pages/error', {user: req.user, slave: data});
      });
    }
  });
});

router.get('/:id/cert', loggedIn, (req, res) => {
  res.render('pages/error', {user: req.user, slave: {message: 'Not implemented!'}});
});

router.get('/i/find', loggedIn, (req, res) => {
  res.render('pages/find', {user: req.user});
});

router.get('/i/slave', loggedIn, (req, res) => {
  Account.findOne({username: req.user.username}, function (err, account) {
    if (err) {
      console.log(err);
    }
    Slave.findOne({_creator: account._id}, function (err, slave) {
      if (err) {
        console.log(err);
      }
      if (slave) {
        return res.render('pages/slave', {user: req.user, slave: slave});
      }
      res.render('pages/slave', {user: req.user, slave: {}});
    });
  });
});

router.get('/i/slavecreate', loggedIn, (req, res) => {
  var id = sgen.create();
  var newID = sgen.fmt(id);
  slaveRegisterValid(newID, function (valid, data) {
    if (valid === 2 || valid === 3) {
      console.log('message:slavecreate ' + data.message);
      getCollectionResult(OwnerType, function (err, ownertype) {
        if (err) {
          console.log(err);
        }
        getCollectionResult(OwnedMonth, function (err, ownedmonth) {
          if (err) {
            console.log(err);
          }
          getCollectionResult(OwnedDateType, function (err, owneddatetype) {
            if (err) {
              console.log(err);
            }
            res.render('pages/newinfo', {user: req.user, slave: data, ownertypes: ownertype, ownedmonths: ownedmonth, owneddatetypes: owneddatetype});
          });
        });
      });
    } else {
      res.render('pages/error', {slave: data});
    }
  });
});

router.post('/:id/slavecreate', loggedIn, (req, res) => {
  Account.findOne({username: req.user.username}, function (err, acct) {
    if (err) {
      console.log(err);
    }
    new Slave({slave_id: req.params.id,
      fullregdate: req.body.fullregdate,
      regdate: req.body.regdate,
      email: req.body.email,
      knownas: req.body.knownas,
      ownertype: req.body.ownertype,
      ownername: req.body.ownername,
      ownedday: req.body.ownedday,
      ownedmonth: req.body.ownedmonth,
      ownedyear: req.body.ownedyear,
      owneddatetype: req.body.owneddatetype,
      _creator: acct._id
    }).save(function (err, result) {
      if (err) {
        console.log(err);
        return res.render('pages/error', {slave: {slave_id: req.params.id, message: err.message}});
      }
      console.log('saved to database');
      if (process.env.NODE_ENV === 'development') {
        console.log(req.body);
        console.log(result);
      }
      createPNG(req.params.id);
      getCollectionResult(OwnerType, function (err, ownertype) {
        if (err) {
          console.log(err);
        }
        getCollectionResult(OwnedMonth, function (err, ownedmonth) {
          if (err) {
            console.log(err);
          }
          getCollectionResult(OwnedDateType, function (err, owneddatetype) {
            if (err) {
              console.log(err);
            }
            res.render('pages/slave', {user: req.user, slave: req.body, ownertypes: ownertype, ownedmonths: ownedmonth, owneddatetypes: owneddatetype});
          });
        });
      });
    });
  });
});

router.get('/i/slaveupdate', loggedIn, (req, res) => {
  Account.findOne({username: req.user.username}, function (err, account) {
    if (err) {
      console.log(err);
    }
    Slave.findOne({_creator: account._id}, function (err, slave) {
      if (err) {
        console.log(err);
      }
      if (slave) {
        getCollectionResult(OwnerType, function (err, ownertype) {
          if (err) {
            console.log(err);
          }
          getCollectionResult(OwnedMonth, function (err, ownedmonth) {
            if (err) {
              console.log(err);
            }
            getCollectionResult(OwnedDateType, function (err, owneddatetype) {
              if (err) {
                console.log(err);
              }
              res.render('pages/updateinfo', {user: req.user, slave: slave, ownertypes: ownertype, ownedmonths: ownedmonth, owneddatetypes: owneddatetype});
            });
          });
        });
      }
    });
  });
});

router.post('/:id/slaveupdate', loggedIn, (req, res) => {
  Slave.findOneAndUpdate({slave_id: req.params.id}, {email: req.body.email,
    knownas: req.body.knownas,
    ownertype: req.body.ownertype,
    ownername: req.body.ownername,
    ownedday: req.body.ownedday,
    ownedmonth: req.body.ownedmonth,
    ownedyear: req.body.ownedyear,
    owneddatetype: req.body.owneddatetype},
    function (err, slave) {
      if (err) {
        console.log(err);
      }
      res.render('pages/slave', {user: req.user, slave: slave});
    });
});

router.get('/i/manageslaves', loggedIn, (req, res) => {
  res.render('pages/error', {user: req.user, slave: {message: 'Not implemented!'}});
});

router.get('/i/about', loggedIn, (req, res) => {
  res.render('pages/error', {user: req.user, slave: {message: 'Not implemented!'}});
});

router.get('/p/register', (req, res) => {
  res.render('pages/register', {account: {}});
});

router.post('/p/register', (req, res) => {
  console.log(req.body);
  // verify('6LcBKCYTAAAAADkvigNHj2ZouRGoYnHFPV7oAM3O', req.body['g-recaptcha-response'], function(success) {
  // console.log('before: success' + sucess);
    // if (success) {
      // console.log('success');
      // res.end('Success!');
  if (req.body.password === req.body.confirmpassword) {
    Account.register(new Account({username: req.body.username,
      email: req.body.email,
      fullname: req.body.fullname}),
      req.body.password,
      function (err, account) {
        if (err) {
          console.log(err);
          return res.render('pages/register', {account: req.body, message: err.message});
        }
        passport.authenticate('local')(req, res, function () {
          return res.render('pages/index', {slave: {message: 'Account created for ' + account.username}});
        });
      });
  } else {
    return res.render('pages/register', {account: {message: 'Username or password invalid.'}});
  }
    /* } else {
      // res.end('Captcha failed, try again.');
      var merged = Object.assign({}, {user: req.user}, {account: {message: 'Username or password invalid.'}});
      return res.render('pages/register', merged);
    }
  });*/
});

router.get('/p/login', (req, res) => {
  res.render('pages/login', {user: req.user});
});

router.post('/p/login', passport.authenticate('local'), (req, res) => {
  // res.redirect('/i/find');
  res.redirect('/i/slave');
});

router.get('/p/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/s/ping', (req, res) => {
  res.status(200).send('pong!');
});

module.exports = router;
