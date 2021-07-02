exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('games', tbl => {
      tbl.uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      tbl
        .text('name')
        .unique()
        .notNullable();
      tbl
        .date('release_date')
      tbl
        .text('banner_pic_URL');
      tbl
        .text('game_pic_URL');
      tbl
        .boolean('public')
        .defaultTo(true);
      tbl
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.raw('now()'));
      tbl
        .timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.raw('now()'));
    })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('games');
};