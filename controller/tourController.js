const Tour = require('../models/tourModel');

exports.getAllTours = async function (req, res) {
  try {
    // 1. Filtering out ['page', 'sort', 'limit', 'fields']
    let queryObj = { ...req.query };
    const excludeArr = ['page', 'limit', 'sort', 'fields'];
    excludeArr.forEach((elem) => delete queryObj[elem]);

    // 2. Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|ne)\b/g,
      (word) => `$${word}`
    ); // b - to match only exact words, g - to replace all not just first
    queryObj = JSON.parse(queryStr);

    let query = Tour.find(queryObj);

    // 3. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4. Excluding display fields
    if (req.query.fields) {
      const selectFields = req.query.fields.split(',').join(' ');
      query = query.select(selectFields);
    } else {
      query = query.select('-__v');
    }

    // 5. Pagination
    const page = req.query.page * 1 || 1;
    req.query.limit *= 1;
    const limit =
      (req.query.limit && req.query.limit > 100 ? 100 : req.query.limit) || 20;
    query = query.skip(page).limit(limit);

    // Sending response
    const tours = await query; // awaiting query
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
