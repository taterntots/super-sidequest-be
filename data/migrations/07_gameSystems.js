exports.up = function (knex) {
  return knex.schema
    .createTable('gameSystems', tbl => {
      tbl
        .uuid('game_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('games')
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
    })
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('gameSystems');
};