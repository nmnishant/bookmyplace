const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const sendMail = require('../utils/sendMail');

const signToken = (id) =>
  JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = function (id, statusCode, message, res) {
  // Generating JWT tokens
  const token = signToken(id);

  // Creating JWT cookie
  res.cookie('JWT', token, {
    httpOnly: true,
    expires: process.env.COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000, // days to milliseconds
    secure: process.env.NODE_ENV === 'production',
  });

  // Sending response
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
  });
};

exports.restrictTo = function (...roles) {
  return function (req, _, next) {
    const userRole = req.user.role;
    if (roles.includes(userRole)) return next();
    next(new AppError(`You dont have permission to perform this action`));
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user password
  const user = await User.findById(req.user._id).select('+password');
  const userPass = user.password;
  const { currentPassword } = req.body;

  // 2. Check if given current password is correct
  if (!(await user.checkPassword(currentPassword, userPass)))
    return next(new AppError(`Current password is incorrect`));

  // 3. Update password ( passwordChangedAt property will be set by pre save hook if password modified or new user )
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4. Getting token and sending response
  createSendToken(user._id, 200, 'Password changed successfully', res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Find if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError(`No user found with this email id`, 404));

  // 2. Generate reset token and send mail
  const resetToken = user.generateResetToken();
  const isMailSent = await sendMail({
    email: user.email,
    subject: 'Here is your password reset link',
    text: `Click : ${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`,
  });
  if (!isMailSent) next(new AppError('Error while sending mail', 500));
  await user.save({ validateBeforeSave: false });

  // 3. Send response
  res.status(200).json({
    status: 'success',
    message: 'E-Mail has been sent to your registered email id',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user by token
  const { resetToken, password, confirmPassword } = req.body;
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpiresIn: { $gte: Date.now() },
  });

  // 2. If user not found, So that mean either reset token is wrong or expired
  if (!user)
    return next(new AppError('Password reset link was wrong or expired', 500));

  // 3. Update password of user (Validation will be done as defined in schema and Hashing will be done by pre save hook)
  user.password = password;
  user.confirmPassword = confirmPassword;
  // Reset temporary reset token
  user.resetToken = undefined;
  user.resetTokenExpiresIn = undefined;

  // Saving user ( passwordChangedAt property will be set by pre save hook if password modified or new user)
  await user.save();

  // 4. Generate JWT token and send response
  createSendToken(user._id, 200, 'Password has been reset successfully', res);
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

  // Login is valid : Store user on req for further use
  req.user = currentUser;
  next();
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
  createSendToken(user._id, 200, 'Login successful', res);
});

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  createSendToken(newUser._id, 200, 'Signup success', res);
});
