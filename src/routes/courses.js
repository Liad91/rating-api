var express = require('express');
var Course = require('../models/course');
var Review = require('../models/review');
var authenticate = require('../middlewares/index').authenticate;
var router = express.Router();

router.get('/', authenticate, function(req, res, next) {
  Course.find({})
    .select({title: 1})
    .exec()
    .then(function(courses) {
      res.status(200).json(courses);
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/:id', authenticate, function(req, res, next) {
  Course.findById(req.params.id)
    .populate('user', 'fullName emailAddress')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'fullName emailAddress' } })
    .exec()
    .then(function(course) {
      if (!course) {
        var err = new Error('Course not found');
        err.status = 404;
        return next(err);
      }
      res.status(200).json(course);
    })
    .catch(function(err) {
      next(err);
    });
});

router.post('/', authenticate, function(req, res, next) {
  var body = req.body;
  var steps = body.steps;

  if (steps && steps.length > 0) {
    for (var i = 0; i < steps.length; i++) {
      if (!steps[i].title || !steps[i].description) {
        var err = new Error('Title and description are required for each step');
        err.status = 400;
        next(err);
        break;
      }
    }
  }
  else {
    steps = null;
  }

  if (steps && body.title && body.description) {
    body.user = req.user._id;
    Course.create(body)
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

router.put('/:id', authenticate, function(req, res, next) {
  var body = req.body;
  var steps = body.steps;

  if (steps && steps.length > 0) {
    for (var i = 0; i < steps.length; i++) {
      if (!steps[i].title || !steps[i].description) {
        var err = new Error('Title and description are required for each step');
        err.status = 400;
        next(err);
        break;
      }
    }
  }
  else {
    steps = null;
  }

  if (steps && body.title && body.description) {
    Course.findById(req.params.id)
      .then(function(course) {
        if (!course) {
          var err = new Error('Course not found');
          err.status = 404;
          throw err;
        }
        else if (!course.user.equals(req.user._id)) {
          var err = new Error('Not authorized');
          err.status = 401;
          throw err;
        }
        else {
          return course.update(body);
        }
      })
      .then(function() {
        res.setHeader('Location', '/');
        res.status(204).end();
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

router.post('/:id/reviews', authenticate, function(req, res, next) {
  var courseId = req.params.id;
  var body = req.body;
  
  if (body.rating) {
    Course.findById(courseId)
      .then(function(course) {
        if (!course) {
          var err = new Error('Course not found');
          err.status = 404;
          throw err;
        }
        else if (course.user.equals(req.user._id)) {
          var err = new Error('Reviewing your own course is not allowed');
          err.status = 403;
          throw err;
        }
        else {
          body.user = req.user._id;
          Review.create(body)
            .then(function(review) {
              course.reviews.push(review._id);
              return course.save();
            })
            .then(function() {
              res.setHeader('Location', '/' + courseId);
              res.status(201).end();
            })
            .catch(function(err) {
              next(err);
            });
        }
      })
      .catch(function(err) {
        next(err);
      });
  }
  else {
    var err = new Error('Rating is required');
    err.status = 400;
    next(err);
  }
});

module.exports = router;