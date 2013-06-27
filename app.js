/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./server/routes'),
    start = require('./server/start'),
    http = require('http'),
    path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(process.env.COOKIE_SECRET || 'Do not share this secret!'));
app.use(express.cookieSession());
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'client')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

routes(app);
start();

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
