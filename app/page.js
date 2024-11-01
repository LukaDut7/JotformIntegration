// app/page.js
import Link from 'next/link';

export default async function Home() {
  // Call the sync API route to ensure the database is up to date
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sync`, {
    method: 'GET',
    cache: 'no-store', // Ensure fresh data
  });

  // Fetch forms from the database via the API route
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forms`, {
    method: 'GET',
    cache: 'no-store',
  });
  const forms = await res.json();

  return (
    <div>
      <h1>Available JotForms</h1>
      <ul>
        {forms.map((form) => (
          <li key={form.form_id}>
            <Link href={`/forms/${form.form_id}`}>Form ID: {form.form_id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
