/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./server/routes'),
    start = require('./server/start'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    User = require('./server/models/user'),
    app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.cookieParser(process.env.COOKIE_SECRET || 'Do not share this secret!'));
app.use(express.cookieSession());
app.use(app.router);
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.localStrategy);

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

routes(app);
start();

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
