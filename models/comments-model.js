const connection = require('../db/connection');

exports.postComment = ({ article_id }, { username, body }) => {
  return connection
    .insert({ article_id, author: username, body })
    .from('comments')
    .returning('*')
    .then(comment => {
      return comment[0];
    });
};

exports.fetchComment = ({ article_id }) => {
  return connection
    .from('comments')
    .select('comments.*')
    .where('comments.article_id', '=', article_id)
    .then(comments => {
      if (!comments.length) {
        return Promise.reject({ status: 404, msg: 'Comment not found!' });
      }
      return comments;
    });
};
