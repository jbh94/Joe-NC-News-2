const connection = require('../db/connection');
const { fetchArticleByArticleId } = require('../models/articles-model');

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

exports.fetchComment = (
  article_id,
  sort_by = 'created_at',
  order = 'desc',
  limit = 10,
  p
) => {
  return connection
    .select('*')
    .from('comments')
    .where('article_id', article_id)
    .orderBy(sort_by, order)
    .limit(limit)
    .offset(p * limit - limit)
    .modify(query => {
      if (article_id) query.where({ article_id });
    })
    .then(comments => {
      const checkIfArticleExists = comments.length
        ? true
        : fetchArticleByArticleId(article_id);
      return Promise.all([comments, checkIfArticleExists]);
    })
    .then(([comments, articleExists]) => {
      if (articleExists) return comments;
      else return Promise.reject({ status: 404, msg: 'Comment not found!' });
    });
};

exports.patchComment = ({ comment_id }, { inc_votes = 0, ...params }) => {
  if (Object.keys(params).length) {
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
      if (!comment.length) {
        return Promise.reject({ status: 404, msg: 'Comment not found!' });
      } else if (inc_votes === 'votes') return comment[0];
      else return comment[0];
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
