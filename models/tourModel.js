const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: [true, 'Tour must have a name'],
    unique: true,
    trim: true,
  },
  summary: {
    type: 'string',
    require: [true, 'Tour must provide a summary'],
    trim: true,
  },
  description: {
    type: 'string',
    require: [true, 'Tour must provide a description'],
    trim: true,
  },
  imageCover: {
    type: 'string',
    require: [true, 'Tour must have a cover image'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  images: [String],
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
  },
  discount: {
    type: Number,
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'You must specify max group size'],
  },
  duration: {
    type: Number,
    required: [true, 'Tour must have a duration'],
  },
  startDates: [Date],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
