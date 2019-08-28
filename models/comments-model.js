const connection = require('../db/connection');

exports.postComment = ({ article_id }, { username, body }) => {
  return connection
    .insert({ article_id, author: username, body })
    .from('comments')
    .returning('*')
    .then(([comment]) => {
      if (comment.body === null) {
        return Promise.reject({ Status: 400, msg: 'Comment failed to post!' });
      } else return comment;
    });
};

exports.fetchComment = (article_id, sort_by = 'created_at', order = 'desc') => {
  return connection
    .select('*')
    .from('comments')
    .where('article_id', article_id)
    .orderBy(sort_by, order)
    .then(comments => {
      if (!comments.length) {
        return Promise.reject({ status: 404, msg: 'Comment not found!' });
      }
      return comments;
    });
};
