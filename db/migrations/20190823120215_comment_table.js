exports.up = function(knex) {
  console.log('Creating the Comments table..');
  return knex.schema.createTable('comments', commentsTable => {
    commentsTable.increments('comment_id').primary();
    commentsTable.text('author').references('users.username');
    commentsTable.integer('article_id').references('articles.article_id');
    commentsTable.integer('votes').defaultTo(0);
    commentsTable.timestamp('created_at').defaultTo(knex.fn.now());
    commentsTable.text('body');
  });
};

exports.down = function(knex) {
  console.log('Removing Comments tables..');
  return knex.schema.dropTable('comments');
};