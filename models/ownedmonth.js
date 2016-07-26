var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var ownedMonth = new mongoose.Schema({
  value: {type: String, unique: true},
  text: String,
  active: {type: Boolean, default: true}
});

ownedMonth.plugin(passportLocalMongoose);

module.exports = mongoose.model('OwnedMonth', ownedMonth);
