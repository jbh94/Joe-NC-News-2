const topicsRouter = require('express').Router();
const { sendTopics } = require('../controllers/topics-controller');
const { methodNotFound } = require('../errors');

topicsRouter
  .route('/')
  .get(sendTopics)
  .all(methodNotFound);

module.exports = topicsRouter;
