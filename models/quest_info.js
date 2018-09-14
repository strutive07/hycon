var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var schema = require('../schemas/room');

module.exports = mongoose.model('room', schema);
