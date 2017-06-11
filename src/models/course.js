var mongoose = require('mongoose');
var Schema = mongoose.Schema;

course = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: String,
  materialsNeeded: String,
  steps: [{
    stepNumber: Number,
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
});

course.method('update', function(updates) {
  Object.assign(this, updates);
  return this.save();
})

module.exports = mongoose.model('Course', course);