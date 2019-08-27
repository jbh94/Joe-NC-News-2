exports.up = function(knex) {
  // console.log('Creating the Users table..');
  return knex.schema.createTable('users', usersTable => {
    usersTable
      .string('username')
      .primary()
      .notNullable();
    usersTable.string('name').notNullable();
    usersTable.string('avatar_url').notNullable();
  });
};

exports.down = function(knex) {
  // console.log('Removing Users tables..');
  return knex.schema.dropTable('users');
};
