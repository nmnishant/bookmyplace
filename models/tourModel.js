const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: 'string',
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      minlength: [5, 'Tour name must have at least 10 characters'],
      maxlength: [30, 'Tour name must not have more than 30 characters'],
    },
    slug: String,
    secret: {
      type: Boolean,
      default: false,
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
      min: [1, 'Rating should be above 1.0'],
      max: [5, 'Rating should be below 5.0'],
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
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('effectivePrice').get(function () {
  return this.price - (this.discount / 100) * this.price || this.price;
});

// Document middlewares
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middlewares
tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

// Aggregate middlewares
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
