var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var Strategy = require('passport-facebook');
var mongoose = require('mongoose');
var assert = require('assert');
var UserModel = require('./models/UserModel.js');
var ChatModel = require('./models/ChatModel.js');
var usernames = {};
app.set('port', (process.env.PORT || 5000));
app.use('/public', express.static(path.join(__dirname, 'public')))
app.set('views', __dirname + '/views'); // views is directory for all template files
app.set('view engine', 'ejs');
app.set('fb-callbackurl', 'https://om-chat.herokuapp.com/login/facebook/return');
app.set('express-secret', 'TRR36PDTHB9XBHCPPYQKGBPKQ');
app.set('mongo-db-url', 'mongodb://root:root@ds125262.mlab.com:25262/heroku_042ngn9t');
app.set('mongo-db-auoinc', 'mongodb://root:root@ds125262.mlab.com:25262/heroku_042ngn9t');
app.set('fb-appid', '131568380325049');
app.set('fb-appsecret', '955090e0aac14c9751adf91e11d7419f')
app.set('fb-callbacklocal', 'http://192.168.2.222:5000/login/facebook/return')
app.set('mongo-db-urllocal', 'mongodb://127.0.0.1:27017/chat')
app.set('fb-appidlocal', '312638455759153')
app.set('fb-appsecretlocal', '661e41cbc07ff112e9f35fbb1a36a4ce')
//'https://om-chat.herokuapp.com/login/facebook/return'
//http://localhost:5000/login/facebook/return
//mongodb://127.0.0.1:27017/chat
//mongodb://root:root@ds125262.mlab.com:25262/heroku_042ngn9t
var mongoDB = app.get('mongo-db-urllocal');
mongoose.connect(mongoDB);
//Get the default connection
db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB Connection Error'));
//Bind connection to error event (to get notification of connection errors)
passport.use(new Strategy({
    clientID: app.get('fb-appidlocal'),
    clientSecret: app.get('fb-appsecretlocal'),
    callbackURL: app.get('fb-callbacklocal')
},function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
}));
// Configure Passport authenticated session persistence.
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
    cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});
// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: app.get('express-secret'), resave: true, saveUninitialized: true }));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session({secret: 'Session Value'}));
var user ={};
function session_add(sess) {
    user.id=sess.userId;
    user.fbid = sess.fbId;
    user.name = sess.displayName;
    user.fbimg = sess.displayimage;
    return user;
}
app.get('/', function(request, response) {
    response.render('pages/login');
});
app.get('/login/facebook', passport.authenticate('facebook'));
app.get('/login/facebook/return',
    passport.authenticate('facebook', { failureRedirect: '/' }),function(req, res) {
    res.redirect('/dashboard');
});
app.get('/dashboard',
    require('connect-ensure-login').ensureLoggedIn(),function(req, res){
    UserModel.find({}, function(err, users) {
        UserModel.find({fbId: {$eq: req.session.passport.user.id}}, function (err, data) {
            var count= '' ;
            if (data.length == 0) {
                count = (users.length)+1;
                var new_user ={
                    userId:count,
                    fbId: req.session.passport.user.id,
                    displayName: req.session.passport.user.displayName,
                    displayimage: 'https://graph.facebook.com/' + user.id + '/picture?width=100&height=100'
                };
                var user = session_add(new_user);
                var userdata = UserModel(new_user);
                userdata.save(function (err) {
                    if (err) throw err;
                });
            } else {
                var pre_user ={
                    userId:data[0].userId,
                    fbId: data[0].fbId,
                    displayName: data[0].displayName,
                    displayimage: data[0].displayimage
                };
                var user = session_add(pre_user);
            }
            if(user) {
                res.render('pages/dashboard', { user: user });
            } else {
                res.redirect('/');
            }
        });
    });
});
app.get('/profile',function(req, res){
    if(user) {
        res.render('pages/profile', {user: user});
    } else {
        res.redirect('/');
    }
});
app.get('/contactlist',function(req, res){
    if(user) {
        var temp = [];
        temp.name = user.name;
        temp.fbid = user.fbid;
        var userMap = {};
        UserModel.find({}, function (err, users) {
            users.forEach(function (user) {
                var userMap = {};
                if (user.fbId != temp.fbid) {
                    userMap = user;
                    temp.push(userMap)
                }
            });
            res.render('pages/contactlist', {user: temp});
        });
    } else {
        res.redirect('/');
    }
});
app.get('/message/:userid',function (req,res) {
    if(user) {
        user.room = 'rm_'+ req.params.userid+'_'+user.id; //rm_[recevierid]_[senderid]
        res.render('pages/index', {user: user});
    } else {
        res.redirect('/');
    }
});
app.get('/index',function(req, res){
    var newuser = UserModel({
        fbId: req.user.id,
        displayName: req.user.displayName
    });
    res.render('pages/index', { user: user });
});
app.get('/logout',function (req,res) {
    user= {};
    req.logOut()  // <-- not req.logout();
    res.redirect('/')

});
/*
Create namespace and rooms
*/
var nameSpace = io.of('/nameSpace');
/* USE THAT NAMESPACE */
var rm = "";
nameSpace.on('connection', function(socket) {
    nameSpace.on('enter room', function (room) {
        rm = room;
        socket.join(room, function (err) {
            if (err) throw err;
        });
    });
    socket.on('chat message', function (msg) {
        nameSpace.emit('chat message', msg);
        console.log(msg);
        change this part
        var chat_data = {
            fbId: msg.fb_userid,
            displayName: msg.fb_username,
            picDisplay: 'https://graph.facebook.com/' + msg.fb_userid + '/picture?width=40&height=40',
            chatRoom: msg.room,
            chatMessage: msg.msg
        };
        console.log(chat_data);
        var newchat = ChatModel(chat_data);
        newchat.save(function (err) {
            if (err) throw err;
        });
    });
    socket.on('fetch previous1', function (room) {
        ChatModel.find({chatRoom: {$eq: room}}, 'displayName picDisplay chatMessage', function (err, data) {
            if (err) throw err;
            socket.emit('fetch previous2', data);
        });
    });
    socket.on('disconnect', function () {
        //console.log('user disconnected');
    });
});

http.listen(app.get('port'), function () {
    //console.log('Node app is running on port', app.get('port'));
});