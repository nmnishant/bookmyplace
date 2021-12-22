const User = require('../models/userModel');

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
