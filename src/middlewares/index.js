var auth = require('basic-auth');
var User = require('../models/user');

function authenticate(req, res, next) {
  var credentials = auth(req);

  if (credentials) {
    User.authenticate(credentials.name, credentials.pass)
      .then(function(user) {
        req.user = user;
        next();
      })
      .catch(function(err) {
        next(err);
      });
  }
  else {
    var err = new Error('Not Authorized');
    err.status = 401;
    next(err);
  }
}

module.exports = {
  authenticate: authenticate
};