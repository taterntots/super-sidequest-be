exports.up = function (knex) {
  return knex.schema.alterTable('userChallenges', table => {
    table
      .integer('total_milliseconds');
  });
};
exports.down = function (knex) {
  return knex.schema.table('userChallenges', function (t) {
    t.dropColumn('total_milliseconds');
  });
};