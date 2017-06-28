var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userId: {
        type: String,
        require: true,
        unique: true
    },
    fbId: {
        type: String,
        require: true,
        unique: true
    },
    displayName: {
        type: String,
        require: true,
        unique: false
    },
    displayimage: {
        type: String,
        require: true,
        unique: false
    }
});
var UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;