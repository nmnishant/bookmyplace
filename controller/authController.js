const JWT = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.protect = catchAsync(async (req, res, next) => {
  // Get JWT token if present else send error
  const authString = req.headers.authorization;
  const token =
    authString && authString.startsWith('Bearer') && authString.split(' ')[1];
  if (!token)
    return next(new AppError('Please login to access this route', 401));

  // Check if token is valid
  // promisify converts a fn which accepts a callback fn into => async fn
  const payload = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(payload.id);
  if (!currentUser)
    return next(new AppError('User is no longer available', 401));

  // Check if password is changed after JWT token was issued to user
  if (currentUser.changedPasswordAfter(payload.iat))
    return next(new AppError('User changed his password. Login again!', 401));

  res.status(200).json({
    status: 'success',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email, password is not empty
  if (!email || !password) {
    return next(new AppError('Please enter your email and password', 400));
  }

  // 2. Check if email, password is correct
  const user = await User.findOne({ email }).select('+password');
  const isPassCorrect =
    user && (await user.checkPassword(password, user.password));

  if (!user || !isPassCorrect) {
    return next(new AppError('Either email or password is incorrect'));
  }

  // 3. Create JWT token
  const token = signToken(user._id);

  // 4. Sending response
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
  });
});
