var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    auth_id : String,
    point : Number,
    first_login : Boolean,
    created_at : String,
    temp_password : String,
    temp_password_time : String
});


module.exports = roomSchema;