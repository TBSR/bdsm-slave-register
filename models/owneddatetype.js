var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var ownedDateType = new mongoose.Schema({
  value: {type: String, unique: true},
  text: String,
  active: {type: Boolean, default: true}
});

ownedDateType.plugin(passportLocalMongoose);

module.exports = mongoose.model('OwnedDateType', ownedDateType);
