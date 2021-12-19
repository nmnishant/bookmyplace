const Tour = require('../models/tourModel');

exports.getAllTours = async function (req, res) {
  try {
    const tours = await Tour.find();
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
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
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
