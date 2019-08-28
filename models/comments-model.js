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

exports.patchComment = ({ comment_id }, { inc_votes, ...params }) => {
  if (!inc_votes) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request - inc_votes not found!'
    });
  } else if (Object.keys(params).length) {
    return Promise.reject({
      status: 400,
      msg: 'Bad request - unexpected params!'
    });
  } else if (typeof inc_votes !== 'number') {
    return Promise.reject({
      status: 400,
      msg: 'Wrong input for inc_votes - expected an number!'
    });
  }
  return connection('comments')
    .where('comment_id', comment_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then(comment => {
      return comment[0];
    });
};

exports.deleteComment = ({ comment_id }) => {
  return connection
    .from('comments')
    .where({ comment_id })
    .delete()
    .returning('*')
    .then(commentId => {
      if (commentId == 0) {
        return Promise.reject({
          status: 404,
          msg: 'Comment not found!'
        });
      }
    });
};
