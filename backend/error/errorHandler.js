const errorHandler = (err, req, res, next) => {
  console.log(err);

  // TODO: send back stack if development or testing
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message,
  });
}

module.exports = errorHandler;