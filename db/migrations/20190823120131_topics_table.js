exports.up = function(knex) {
  console.log('Creating the Topics table..');
  return knex.schema.createTable('topics', topicsTable => {
    topicsTable.string('slug').primary();
    topicsTable.text('description');
  });
};

exports.down = function(knex) {
  console.log('Removing Topics tables..');
  return knex.schema.dropTable('topics');
};
