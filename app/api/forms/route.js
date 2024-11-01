import db from '../../../lib/db';

export async function GET(request) {
  try {
    const forms = await db('forms').select();

    return new Response(JSON.stringify(forms), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch forms' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
