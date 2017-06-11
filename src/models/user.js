var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var user = new Schema({
  fullName: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
});

user.static('authenticate', function(email, password) {
  var model = this;
  var authError = new Error('Authentication faild');
  authError.status = 401;

  return new Promise(function(resolve, reject) {
    model.findOne({emailAddress: email})
      .then(function(user) {
        if (!user) {
          reject(authError);
        }
        else {
          bcrypt.compare(password, user.password)
            .then(function(match) {
              if (!match) {
                reject(authError);
              }
              resolve(user);
            })
            .catch(function(err) {
              reject(err);
            });
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
});

user.pre('save', function(next) {
  var user = this;

  bcrypt.hash(this.password, 10)
    .then(function(encrypted) {
      user.password = encrypted;
      next();
    })
    .catch(function(err) {
      next(err);
    });
});

user.plugin(uniqueValidator);

module.exports = mongoose.model('User', user);