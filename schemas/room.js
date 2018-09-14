var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    wallet_name : String,
    server_wallet : String,
    server_private_key : String,
    server_mnemonic : String,
    selected_person : String,
    selected_person_name : String,
    members : Array,
    random_extracted_seed : Array,
},{ usePushEach: true });


module.exports = roomSchema;