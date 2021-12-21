const AppError = require('./AppError');

const sendDevErr = function (err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
  });
};

const sendProdError = function (err, req, res) {
  // If err is trusted (we defined it with our own message and code)
  if (err.trustedError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming errors, which caught by our catchAsync() - So do not leak error details to client
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

const DBhandleCastError = function (err) {
  return new AppError(`Invalid ${err.path} : ${err.value}`, 400);
};

const DBduplicateError = function (err) {
  return new AppError(
    `${Object.values(err.keyValue).join(', ')} already exists`,
    400
  );
};

const DBValidatorError = function (err) {
  return new AppError(
    `${Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')}`,
    400
  );
};

module.exports = (err, req, res, next) => {
  // Defining statusCodes, status if err is catch by our catchAsync() [ Non - trusted errors / programming errors]
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';

  // if in development, send full error details
  if (process.env.NODE_ENV === 'development') {
    sendDevErr(err, req, res);
  }

  // If in production, show limited error details
  else if (process.env.NODE_ENV === 'production') {
    // Handling some errors which are catched by our catchAsync(), but popular, So make it trusted and define err message and statusCode
    if (err.name === 'CastError') err = DBhandleCastError(err);
    else if (err.code === 11000) err = DBduplicateError(err);
    else if (err.name === 'ValidationError') err = DBValidatorError(err);
    sendProdError(err, req, res);
  }
};
