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

exports.fetchArticles = ({ sort_by, order = 'asc', author, topic }) => {
  return connection('articles')
    .select(
      'articles.author',
      'articles.title',
      'articles.article_id',
      'articles.topic',
      'articles.created_at',
      'articles.votes'
    )
    .count({ comment_count: 'comments.article_id' })
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .groupBy('articles.article_id')
    .orderBy(sort_by || 'created_at', order)
    .modify(query => {
      if (author) query.where('articles.author', author);
      if (topic) query.where('articles.topic', topic);
    })
    .then(articles => {
      if (!articles.length) {
        return Promise.reject({ status: 404, msg: 'Articles not found!' });
      } else return articles;
    });
};
