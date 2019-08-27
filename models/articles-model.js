const connection = require('../db/connection');

exports.fetchArticleByArticleId = article_id => {
  return connection
    .select('articles.*')
    .from('articles')
    .count('comment_id AS comment_count')
    .where('articles.article_id', article_id)
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .groupBy('articles.article_id')
    .then(articleData => {
      if (!articleData.length) {
        return Promise.reject({ status: 404, msg: 'Article not found!' });
      } else {
        return articleData[0];
      }
    });
};

exports.updateVotes = (article_id, inc_votes) => {
  if (article_id === undefined && inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: 'Bad request!' });
  } else
    return connection
      .select('votes.*')
      .from('articles')
      .increment('votes', inc_votes)
      .where({ article_id })
      .returning('*')
      .then(articleData => {
        return articleData[0];
      });
};
