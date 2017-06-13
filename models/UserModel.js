var mongoose = require('mongoose');
var assert = require('assert');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    fbId: {
        type: String,
        require: true,
        unique: true
    },
    displayName: {
        type: String,
        require: true,
        unique: false
    }
});
var UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;