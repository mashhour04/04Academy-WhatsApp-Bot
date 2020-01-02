const express = require('express');

const app = express();

require('dotenv').config();
global.Promise = require('bluebird');
global._ = require('lodash');
require('./startup/db').connect();
require('./startup/logging').handleErrors();
require('./startup/middlewares')(app);
require('./startup/routes')(app);
require('./startup/init')(app);

// eslint-disable-next-line global-require
if (process.env.NODE_ENV === 'initData') require('./startup/dataEntryScripts');

// TODO: [SOOTYAI-779] this file will create users for stress testing, uncomment it in your server you want to test on
// require('./dataEntryScripts/others/userGrpDataForStressTesting')();

module.exports = app;
