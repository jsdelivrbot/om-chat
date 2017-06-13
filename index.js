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

app.set('port', (process.env.PORT || 5000));

app.use('/public', express.static(path.join(__dirname, 'public')))

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.set('fb-callbackurl', 'https://om-chat.herokuapp.com/login/facebook/return');
app.set('express-secret', 'TRR36PDTHB9XBHCPPYQKGBPKQ');
app.set('mongo-db-url', 'mongodb://root:root@ds125262.mlab.com:25262/heroku_042ngn9t');

//'https://om-chat.herokuapp.com/login/facebook/return'
//http://localhost:5000/login/facebook/return
//mongodb://127.0.0.1:27017/chat

var mongoDB = app.get('mongo-db-url');
mongoose.connect(mongoDB);

//Get the default connection
db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB Connection Error'));

/*var bookSchema = mongoose.Schema({
  name: String,
  //Also creating index on field isbn
  isbn: {type: String, index: true},
  author: String,
  pages: Number
});*/

//Bind connection to error event (to get notification of connection errors)
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));

passport.use(new Strategy({
    clientID: '131568380325049',
    clientSecret: '955090e0aac14c9751adf91e11d7419f',
    callbackURL: app.get('fb-callbackurl')
},

function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

  // Configure Passport authenticated session persistence.
//
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
app.use(passport.session());

app.get('/', function(request, response) {
  response.render('pages/login');
});

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/index');
  });

app.get('/index',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    var newuser = UserModel({
        fbId: req.user.id,
        displayName: req.user.displayName
    });
    /*newuser.save(function(err){
      if(err) throw err;
    });*/
    res.render('pages/index', { user: req.user });
  });

/*
Create namespace and rooms
*/

var nameSpace = io.of('/nameSpace');

/* USE THAT NAMESPACE */
var rm = "";
nameSpace.on('connection', function(socket){
  socket.on('enter room', function(room) {
        rm = room;
        socket.join(room, function(err){
          if(err) throw err;
        });
    });
  socket.on('chat message', function(msg){
    socket.emit('chat message', msg);
    var newchat = ChatModel({
        fbId: msg.fb_userid,
        displayName: msg.fb_username,
        picDisplay: 'https://graph.facebook.com/'+msg.fb_userid+'/picture?width=40&height=40',
        chatRoom: rm,
        chatMessage: msg.msg
    });
    newchat.save(function(err){
      if(err) throw err;
    });
  });

  socket.on('fetch previous', function(room){
      ChatModel.find({chatRoom: {$eq: 'room12345'}}, 'displayName picDisplay chatMessage', function(err, data){
          if(err) throw err;
          socket.emit('fetch previous', data);
      });
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});