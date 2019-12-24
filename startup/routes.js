const exphbs = require('express-handlebars');
const path = require('path');
const express = require('express');

const ErrorHandler = require('../middlewares/errorHandlerMiddleware');
const apiRouter = require('../components/api/apiRouter');
module.exports = app => {
  app.use(apiRouter, apiRouter)

  app.use(ErrorHandler.catch404Errors);
  app.use(ErrorHandler.handleUnexpectedErrors);
  app.engine(
    '.html',
    exphbs({
      extname: '.html',
      layoutsDir: path.resolve('views')
    })
  );
  app.set('view engine', 'html');
};
