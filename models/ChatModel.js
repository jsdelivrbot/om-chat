var mongoose = require('mongoose');
var assert = require('assert');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    chatFrom: {
        type: String,
        require: true
    },
    displayName: {
        type: String,
        require: true
    },
    picDisplay: {
        type: String,
        require: true
    },
    chatRoom: {
        type: String,
        require: true
    },
    chatMessage: {
        type: String,
        require: true
    }
});
var ChatModel = mongoose.model("chat", chatSchema);
module.exports = ChatModel;