/* eslint camelcase: ["error", {properties: "never"}] */

var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var account = new mongoose.Schema({
  fullname: String,
  username: {type: String, unique: true},
  password: String,
  admin: Boolean,
  email: String,
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now},
  slaves: [{type: mongoose.Schema.Types.ObjectId, ref: 'Slave'}]
});

account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', account);
