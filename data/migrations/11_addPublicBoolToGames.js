exports.up = function (knex) {
  return knex.schema.alterTable('games', table => {
    table
      .boolean('public')
      .defaultTo(true);
  });
};
exports.down = function (knex) {
  return knex.schema.table('games', function (t) {
    t.dropColumn('public');
  });
};