exports.up = function (knex) {
    return knex.schema.alterTable('users', tbl => {
        tbl
            .boolean('is_patreon')
            .defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('users', function (tbl) {
        tbl.dropColumn('is_patreon');
    });
};