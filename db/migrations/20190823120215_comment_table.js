exports.up = function(knex) {
  // console.log('Creating the Comments table..');
  return knex.schema.createTable('comments', commentsTable => {
    commentsTable.increments('comment_id').primary();
    commentsTable
      .text('author')
      .references('users.username')
      .notNullable();
    commentsTable
      .integer('article_id')
      .references('articles.article_id')
      .notNullable();
    commentsTable
      .integer('votes')
      .defaultTo(0)
      .notNullable();
    commentsTable
      .timestamp('created_at')
      .defaultTo(knex.fn.now())
      .notNullable();
    commentsTable.text('body').notNullable();
  });
};

exports.down = function(knex) {
  // console.log('Removing Comments tables..');
  return knex.schema.dropTable('comments');
};
