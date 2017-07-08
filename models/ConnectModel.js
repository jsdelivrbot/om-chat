/**
 * Created by racchanak on 3/7/17.
 */

var mongoose = require('mongoose');
var assert = require('assert');
var Schema = mongoose.Schema;

var connectSchema = new Schema({
    connectId: {
        type: String,
        require: true
    },
    groupId: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        require: true
    },
    connectType: {
        type: String,
        enum : ['Admin','User'],
        default: 'User'
    },
    connectStatus: {
        type: String,
        enum : ['Activate','Deactivate'],
        default: 'Activate'
    },
    groupRoom: {
        type: String,
        require: true
    },
    connectDate: {
        type: Date,
        require: true
    },
    connectDelete: {
        type: String,
        enum : ['No','Yes'],
        default: 'No'
    }
});
var ConnectModel = mongoose.model("connect", connectSchema);
module.exports = ConnectModel;