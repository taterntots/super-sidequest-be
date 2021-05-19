exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('difficulty', tbl => {
      tbl.uuid('id')
        .primary()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      tbl
        .text('name')
        .notNullable();
      tbl
        .integer('points')
        .notNullable();
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
  return knex.schema.dropTableIfExists('difficulty');
};