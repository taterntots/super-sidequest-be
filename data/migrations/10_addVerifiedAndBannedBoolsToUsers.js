exports.up = function (knex) {
  return knex.schema.alterTable('users', tbl => {
    tbl
      .boolean('is_verified')
      .defaultTo(false);
    tbl
      .boolean('is_banned')
      .defaultTo(false);
    tbl
      .integer('verification_code');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (tbl) {
    tbl.dropColumn('is_verified');
    tbl.dropColumn('is_banned');
    tbl.dropColumn('verification_code');
  });
};