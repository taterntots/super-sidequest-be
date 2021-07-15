exports.up = function (knex) {
  return knex.schema.alterTable('users', tbl => {
    tbl
      .text('twitter_URL');
    tbl
      .text('youtube_URL');
    tbl
      .text('twitch_URL');
    tbl
      .text('discord_URL');
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (tbl) {
    tbl.dropColumn('twitter_URL');
    tbl.dropColumn('youtube_URL');
    tbl.dropColumn('twitch_URL');
    tbl.dropColumn('discord_URL');
  });
};