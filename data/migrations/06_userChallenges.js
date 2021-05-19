exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('userChallenges', tbl => {
      tbl.uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      tbl
        .uuid('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      tbl
        .uuid('challenge_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('challenges')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      tbl
        .boolean('completed')
        .defaultTo(false);
      tbl
        .integer('high_score');
      tbl
        .integer('speedrun_hours');
      tbl
        .integer('speedrun_minutes');
      tbl
        .integer('speedrun_seconds');
      tbl
        .integer('speedrun_milliseconds');
      tbl
        .text('notes');
      tbl
        .text('video_URL');
      tbl
        .text('image_URL');
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
  return knex.schema.dropTableIfExists('userChallenges');
};