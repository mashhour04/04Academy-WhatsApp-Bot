const express = require('express');
const authorizeMiddleware = require('../../../middlewares/authorizeMiddleware');

const router = express.Router();

const controller = require('./knowledgeController');
const validator = require('./validations');
const { permissions } = require('../../../shared/constants/defaults');

// Middlewares
const validate = require('../../../middlewares/validateMiddleware');


// @router GET api/knowledge/report/article-book/me?lastId=000000000000&search=&type=[book|article]&limit=10
router.get(
  '/report/article-book/me',
  [
    authorizeMiddleware([permissions.USER]),
    validate(validateBookArticleRequestReport)
  ],
  controller.bookArticleReportForMe
);


// end  Report --------------
module.exports = router;
