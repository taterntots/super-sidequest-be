exports.up = function (knex) {
  return knex.schema.alterTable('users', table => {
    table
      .text('banner_pic_URL');
    table
      .text('profile_color_one');
    table
      .text('profile_color_two');
  });
};
exports.down = function (knex) {
  return knex.schema.table('users', function (t) {
    t.dropColumn('banner_pic_URL');
    t.dropColumn('profile_color_one');
    t.dropColumn('profile_color_two');
  });
};