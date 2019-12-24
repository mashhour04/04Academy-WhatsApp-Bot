const config = require('config');
const url = config.get('mongodb');
// connect to db and setup auto-increment
const mongoose = require('mongoose');
const bunyanMongoDbLogger = require('bunyan-mongodb-logger');

const logger = new bunyanMongoDbLogger({
  name: 'alibot_logs',
  streams: ['stdout', 'mongodb'],
  url,
  level: process.env.LOG_LEVEL || 'info'
});

const connection = mongoose.createConnection(url, { useNewUrlParser: true });

// mongoose.plugin(require('mongoose-ref-validator'));
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

global.logger = logger;
mongoose.set('debug', true);
module.exports.connection = connection;
