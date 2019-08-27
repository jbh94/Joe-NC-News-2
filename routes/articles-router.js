const articlesRouter = require('express').Router();
const {
  sendArticleByArticleId,
  patchVotes
} = require('../controllers/articles-controller');
const { methodNotFound } = require('../errors');

articlesRouter
  .route('/:article_id')
  .get(sendArticleByArticleId)
  .patch(patchVotes)
  .all(methodNotFound);

module.exports = articlesRouter;
