var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name : String,
    wallet : String,
    entered_wallet : Array
},{ usePushEach: true });


module.exports = userSchema;