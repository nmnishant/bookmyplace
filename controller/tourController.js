const Tour = require('../models/tourModel');
const PerformQuery = require('../utils/PerformQuery');

exports.top5Tours = function (req, res, next) {
  req.query.sort = '-ratingsAverage,price,-ratingsQuantity';
  req.query.page = 1;
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingsAverage,summary,imageCover';
  next();
};

exports.tourStats = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.toursInGivenYear = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getAllTours = async function (req, res) {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      body: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async function (req, res) {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      body: tour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async function (req, res) {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      body: updatedTour,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async function (req, res) {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      body: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
