// lib/syncDatabase.js
import JotForm from 'jotform';
import db from './db';

JotForm.options({
  apiKey: process.env.JOTFORM_API_KEY,
});

export async function syncDatabase() {
  // Fetch forms from JotForm API
  const forms = await JotForm.getForms();

  // Synchronize database and webhooks
  for (const form of forms) {
    try {
      // Check if form exists in the database
      const existingForm = await db('forms').where({ form_id: form.id }).first();

      if (!existingForm) {
        // Insert new form into the database
        await db('forms').insert({ form_id: form.id });

        // Create a new table for the form submissions
        const tableName = `form_${form.id}`;
        const tableExists = await db.schema.hasTable(tableName);

        if (!tableExists) {
          await db.schema.createTable(tableName, function (table) {
            table.increments('id').primary();
            table.string('submission_id').unique().notNullable();
            table.jsonb('submission_data').notNullable();
            table.timestamp('submitted_at').defaultTo(db.fn.now());
          });
          console.log(`Created table ${tableName} for form ID ${form.id}`);
        }
      }

      // Check if webhook is set up
      const hasWebhook = existingForm ? existingForm.has_webhook : false;

      if (!hasWebhook) {
        const webhooks = await JotForm.getFormWebhooks(form.id);
        if (Object.keys(webhooks).length === 0) {
          // Add webhook
          const webhookUrl = `${process.env.BASE_URL}/api/webhook/${form.id}`;
          await JotForm.createFormWebhook(form.id, webhookUrl);
          // Update the database
          await db('forms').where({ form_id: form.id }).update({ has_webhook: true });
          console.log(`Webhook added for form ID ${form.id}`);
        } else {
          // Webhook exists, update has_webhook
          await db('forms').where({ form_id: form.id }).update({ has_webhook: true });
        }
      }
    } catch (error) {
      console.error(`Error processing form ID ${form.id}:`, error);
    }
  }
}
