const {
  postComment,
  fetchComment,
  patchComment,
  deleteComment
} = require('../models/comments-model');

exports.createComment = (req, res, next) => {
  postComment(req.params, req.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.getComment = (req, res, next) => {
  const { sort_by } = req.query;
  const { order } = req.query;
  const { article_id } = req.params;
  const { topic } = req.params;
  fetchComment(article_id, sort_by, order, topic)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.updateComment = (req, res, next) => {
  patchComment(req.params, req.body)
    .then(comment => {
      res.status(200).send(comment);
    })
    .catch(next);
};

exports.removeComment = (req, res, next) => {
  deleteComment(req.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
