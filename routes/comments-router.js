const commentsRouter = require('express').Router();

const {
  updateComment,
  removeComment
} = require('../controllers/comments-controller');

const { methodNotFound } = require('../errors');

commentsRouter
  .route('/:comment_id')
  .patch(updateComment)
  .delete(removeComment)
  .all(methodNotFound);

module.exports = commentsRouter;
