const { connection } = require('./config');
const userSchema = require('./userSchema');


module.exports = {
  userModel: connection.model('User', userSchema),
};
