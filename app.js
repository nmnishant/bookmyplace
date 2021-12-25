const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Local modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./utils/globalErrorHandler');

// Rate limiter
const limiter = rateLimit({
  max: 10, // 10 requests per 30 seconds
  windowMs: 30000,
  message: 'Too many requests',
});

const app = express();

// *********************
//  *** MIDDLEWARES ***
// *********************

// Setting secure headers
app.use(helmet());

// Logging network requests when in development
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting on /api route
app.use('/api', limiter);

// Get data in req.body with data limit
app.use(express.json({ limit: '5kb' }));

// Data sanitization
app.use(sanitize()); // 1. No-SQL injection sanitize
app.use(xss()); // 2. XSS sanitize

// Prevent paramater pollution
app.use(
  hpp({
    whitelist: ['price', 'duration', 'discount'],
  })
);

// Setting static folder path
app.use(express.static(`${__dirname}/public`));

// ****************
//  *** Routes ***
// ****************
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) =>
  next(new AppError(`Route ${req.originalUrl} not defined on server`, 404))
);

// *** Global error handler middleware ***
app.use(globalErrorHandler);

module.exports = app;
