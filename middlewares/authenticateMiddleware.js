const jsonwebtoken = require('jsonwebtoken');

const jwt = Promise.promisifyAll(jsonwebtoken);
const config = require('config');

const isAuthenticated = async (req, res, next) => {

  // @TODO: [SOOTYAI-774] remove String(req.headers.referer).split('access_token=')[1]; and check access_token in updateCourseProgress
  const token = req.body.access_token || req.query.access_token || req.headers.access_token || String(req.headers.referer).split('access_token=')[1];
  if (token) {
    try {
      const decoded = await jwt.verify(token, config.get('jwtPrivateKey'));
      req.user = decoded;
      req.user.token = token;
      req.decoded = decoded;
      return next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: 'Failed to authenticate token.' });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No token provided.'
    });
  }
};

module.exports = isAuthenticated;
