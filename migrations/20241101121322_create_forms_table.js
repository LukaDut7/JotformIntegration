exports.up = function(knex) {
  return knex.schema.createTable('forms', function(table) {
    table.increments('id').primary();
    table.string('form_id').unique().notNullable();
    table.boolean('has_webhook').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forms');
};
