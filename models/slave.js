/* eslint camelcase: ["error", {properties: "never"}] */

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var slave = new mongoose.Schema({
  _creator: {type: String, ref: 'Account'},
  slave_id: {type: String, unique: true},
  fullregdate: String,
  regdate: String,
  email: String,
  knownas: String,
  ownertype: String,
  ownername: String,
  ownedday: String,
  ownedmonth: String,
  ownedyear: String,
  owneddatetype: String
});

slave.plugin(passportLocalMongoose);

module.exports = mongoose.model('Slave', slave);
