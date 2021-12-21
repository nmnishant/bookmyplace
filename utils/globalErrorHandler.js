const sendDevErr = function (err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    errStack: err.stack,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith('4') ? 'fail' : 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendDevErr(err, req, res);
  }

  if (err.trustedError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};
