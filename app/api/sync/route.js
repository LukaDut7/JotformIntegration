// app/api/sync/route.js
import JotForm from 'jotform';
import db from '../../../lib/db';

const jotform = new JotForm(process.env.JOTFORM_API_KEY, {
  baseURL: 'https://eu-api.jotform.com'
});

export async function GET(request) {
  try {
    // Fetch forms from JotForm API
    const forms = await jotform.user.getForms();
    // Synchronize database and webhooks
    for (const form of forms.content) {
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
        const webhooks = await jotform.form.getWebhooks(form.id);
        console.log(webhooks)
        console.log(Object.keys(webhooks.content).length)
        if (Object.keys(webhooks.content).length === 0) {
          // Add webhook
          const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/${form.id}`;
          await jotform.form.createWebhook(form.id, webhookUrl);
          // Update the database
          await db('forms').where({ form_id: form.id }).update({ has_webhook: true });
          console.log(`Webhook added for form ID ${form.id}`);
        } else {
          // Webhook exists, update has_webhook
          await db('forms').where({ form_id: form.id }).update({ has_webhook: true });
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Synchronization complete' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error during synchronization:', error);
    return new Response(JSON.stringify({ error: 'Synchronization failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
