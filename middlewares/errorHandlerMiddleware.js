/* eslint-disable no-param-reassign */
// TODO: review

const createError = require('http-errors');

const { logger } = require('../startup/logging');
const CustomError = require('../shared/errors/CustomError');

// catch 404 and forward to error handler
module.exports.catch404Errors = (req, res, next) => {
  next(createError(404));
};

module.exports.handleUnexpectedErrors = (err, req, res, next) => {
  err.code = +err.statusCode || +err.code || 500;
  err.url = req.originalUrl;

  const error = new CustomError(
    err.name,
    err.messageKey,
    err.message,
    err.code
  );

  // TODO: https://www.joyent.com/node-js/production/design/errors

  if (err.code < 100 || err.code >= 600) error.code = 500;

  if (process.env.NODE_ENV === 'development')
    logger.error(
      JSON.stringify(
        err,
        [
          'messageKey',
          'message',
          'stack',
          'url',
          'name',
          'code',
          'Symbol(message)'
        ],
        3
      )
    );

  if (!(error.code >= 100 && error.code < 600)) error.code = 500;

  return res
    .status(error.code)
    .json({ error: err.message || 'Internal server error...' });
};
