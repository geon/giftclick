var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// var routes = require('./routes/index');
// var users = require('./routes/users');
// app.use('/', routes);
// app.use('/users', users);

var api = express.Router();
var apiRoutes = require('./routes/api.js');
api.use(function(req, res, next) {

	// CORS-headers.
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
api.get('/users/fb/:facebookId/clicksLeft', apiRoutes.getClicksLeft);
api.get('/users/fb/:facebookId/lastClickOnGiftType/:giftTypeSku', apiRoutes.getLastClickOnGiftType);
api.post('/users/fb/:facebookId/lastClickOnGiftType/:giftTypeSku', apiRoutes.postClicks);
app.use('/api/v1', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.end();
    console.error(new Date(), 'Global error handler.', err.stack);
});


module.exports = app;
