const { postComment, fetchComment } = require('../models/comments-model');

exports.createComment = (req, res, next) => {
  postComment(req.params, req.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.getComment = (req, res, next) => {
  fetchComment(req.params)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
