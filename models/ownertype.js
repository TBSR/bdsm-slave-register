var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var ownerType = new mongoose.Schema({
  value: {type: String, unique: true},
  text: String,
  active: {type: Boolean, default: true}
});

ownerType.plugin(passportLocalMongoose);

module.exports = mongoose.model('OwnerType', ownerType);
