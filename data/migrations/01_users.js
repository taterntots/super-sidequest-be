exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('users', tbl => {
      tbl.uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      tbl
        .text('username')
        .unique()
        .notNullable();
      tbl
        .text('email')
        .unique()
        .notNullable();
      tbl
        .text('password')
        .notNullable();
      tbl
        .text('reset_link')
      tbl
        .text('profile_pic_URL');
      tbl
        .text('banner_pic_URL');
      tbl
        .text('profile_color_one');
      tbl
        .text('profile_color_two');
      tbl
        .boolean('is_admin')
        .defaultTo(false);
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
  return knex.schema.dropTableIfExists('users');
};