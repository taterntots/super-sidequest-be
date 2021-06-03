exports.up = function (knex) {
  return knex.schema.alterTable('userChallenges', table => {
    table
      .boolean('is_active')
      .defaultTo(true);
  });
};
exports.down = function (knex) {
  return knex.schema.table('userChallenges', function (t) {
    t.dropColumn('is_active');
  });
};