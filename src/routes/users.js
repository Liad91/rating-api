var express = require('express');
var User = require('../models/user');
var authenticate = require('../middlewares/index').authenticate;
var router = express.Router();

router.get('/', authenticate, function(req, res, next) {
  res.status(200).json(req.user);
});

router.post('/', function(req, res, next) {
  var body = req.body;
  
  if (body.fullName && body.emailAddress && body.password) {
    User.create(body)
      .then(function() {
        res.setHeader('Location', '/');
        res.status(201).end();
      })
      .catch(function(err) {
        next(err);
      });
  }
  else {
    var err = new Error('All fields are required');
    err.status = 400;
    next(err);
  }
});

module.exports = router;