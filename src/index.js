'use strict';

// load modules
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var seeder = require('mongoose-seeder');

// load routes
var users = require('./routes/users');
var courses = require('./routes/courses');

// load dummy data
var data = require('./data/data.json');

var app = express();

// set mongodb connection
mongoose.connect('mongodb://localhost:27017/rating-api');

var db = mongoose.connection;

// handle connection error
db.on('error', console.error.bind(console, 'connection error:'));

// connection established
db.once('open', function() {
  // seed dummy data
  seeder.seed(data)
    .catch(function(err) {
      console.error(err);
    });
})

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set routes
app.use('/api/users', users);
app.use('/api/courses', courses);

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

// catch 404 and forward to global error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Express's global error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
var server = app.listen(app.get('port'), function() {
  console.log('Express server is listening on port ' + server.address().port);
});
