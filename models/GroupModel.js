/**
 * Created by racchanak on 3/7/17.
 */
var mongoose = require('mongoose');
var assert = require('assert');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
    groupId: {
        type: String,
        require: true
    },
    groupName: {
        type: String,
        require: true
    },
    groupImg: {
        type: String,
        require: true
    },
    groupAdmin: {
        type: String,
        require: true
    },
    groupRoom: {
        type: String,
        require: true
    },
    groupCounts: {
        type: String,
        require: true
    },
    groupStatus: {
        type: String,
        enum : ['Activate','Deactivate'],
        default: 'Activate'
    },
    groupDate: {
        type: Date,
        require: true
    },
    groupDelete: {
        type: String,
        enum : ['No','Yes'],
        default: 'No'
    }
});
var GroupModel = mongoose.model("group", groupSchema);
module.exports = GroupModel;