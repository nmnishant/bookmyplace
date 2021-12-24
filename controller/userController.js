const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

function filterGivenData(dataObj, filterArr) {
  const filterObj = {};
  Object.keys(dataObj).forEach((key) => {
    if (filterArr.includes(key)) filterObj[key] = dataObj[key];
  });
  return filterObj;
}

exports.updateUserInfo = catchAsync(async (req, res, next) => {
  const filteredData = filterGivenData(req.body, ['name', 'email']);
  const newData = await User.findByIdAndUpdate(req.user._id, filteredData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    body: newData,
  });
});

exports.getAllUsers = async function (req, res) {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    body: users,
  });
};

exports.createUser = function (req, res) {};

exports.getUser = function (req, res) {};

exports.updateUser = function (req, res) {};

exports.deleteUser = function (req, res) {};
