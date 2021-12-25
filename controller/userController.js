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
  // Filter given data to omly have name, email field
  const filteredData = filterGivenData(req.body, ['name', 'email']);

  // Then update it using findByIdAndUpdate - to prevent from custom validators like confirmPassword validators but run built-in validators
  const newData = await User.findByIdAndUpdate(req.user._id, filteredData, {
    new: true,
    runValidators: true,
  });

  // Sending response
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

exports.deleteUser = catchAsync(async (req, res) => {
  // Prevent deleted user to appear in "Get All Users" - implemening pre find hook in userModel
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
