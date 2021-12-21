const Tour = require('../models/tourModel');
const PerformQuery = require('../utils/PerformQuery');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.top5Tours = function (req, res, next) {
  req.query.sort = '-ratingsAverage,price,-ratingsQuantity';
  req.query.page = 1;
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary,imageCover';
  next();
};

exports.tourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $group: {
        _id: null,
        numTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        totalRatingsQuantity: { $sum: '$ratingsQuantity' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    body: stats,
  });
});

exports.toursInGivenYear = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const toursInGivenYear = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: toursInGivenYear.length,
    body: toursInGivenYear,
  });
});

exports.getAllTours = catchAsync(async (req, res) => {
  // Performing query operations
  const queryObj = new PerformQuery(Tour.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  // awaiting query
  const tours = await queryObj.query;

  // Sending response
  res.status(200).json({
    status: 'success',
    result: tours.length,
    body: tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    body: newTour,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with this id', 404));
  }
  res.status(200).json({
    status: 'success',
    body: tour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError('No tour found with this id', 404));
  }

  res.status(200).json({
    status: 'success',
    body: updatedTour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with this id', 404));
  }

  res.status(204).json({
    status: 'success',
    body: null,
  });
});
