const express = require('express');
const morgan = require('morgan');

// Local modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./utils/globalErrorHandler');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) =>
  next(new AppError(`Route ${req.originalUrl} not defined on server`, 404))
);

// Global error handler middleware
app.use(globalErrorHandler);

module.exports = app;
