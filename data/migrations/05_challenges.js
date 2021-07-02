exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('challenges', tbl => {
      tbl.uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      tbl
        .text('name')
        .notNullable();
      tbl
        .uuid('game_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('games')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      tbl
        .text('description');
      tbl
        .uuid('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      tbl
        .uuid('system_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('systems')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      tbl
        .uuid('difficulty_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('difficulty')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      tbl
        .text('rules');
      tbl
        .boolean('is_high_score')
        .defaultTo(false);
      tbl
        .boolean('is_speedrun')
        .defaultTo(false);
      tbl
        .boolean('featured')
        .defaultTo(false);
      tbl
        .text('prize')
      tbl
        .datetime('start_date');
      tbl
        .datetime('end_date');
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
  return knex.schema.dropTableIfExists('challenges');
};