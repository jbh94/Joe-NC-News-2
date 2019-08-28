const articlesRouter = require('express').Router();
const {
  sendArticleByArticleId,
  patchVotes,
  getArticles
} = require('../controllers/articles-controller');

const {
  createComment,
  getComment
} = require('../controllers/comments-controller');
const { methodNotFound } = require('../errors');

articlesRouter
  .route('/:article_id')
  .get(sendArticleByArticleId)
  .patch(patchVotes)
  .all(methodNotFound);

articlesRouter
  .route('/:article_id/comments')
  .post(createComment)
  .get(getComment)
  .all(methodNotFound);

articlesRouter
  .route('/')
  .get(getArticles)
  .all(methodNotFound);

module.exports = articlesRouter;
