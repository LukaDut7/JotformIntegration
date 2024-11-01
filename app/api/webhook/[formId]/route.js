import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// Ensure the route runs in the Edge Runtime
export const config = {
  runtime: 'edge',
};

export async function POST(req, { params }) {
  const { formId } = params;
  const contentType = req.headers.get('content-type');

  let submissionData = {};
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    for (const [key, value] of formData.entries()) {
      submissionData[key] = value;
    }
  } else {
    console.error('Unsupported content type:', contentType);
    return new NextResponse('Unsupported content type', { status: 400 });
  }

  console.log(submissionData);
  const submissionId = submissionData.submissionID;

  try {
    const tableName = `form_${formId}`;

    await db(tableName).insert({
      submission_id: submissionId,
      submission_data: JSON.stringify(submissionData),
    });

    return NextResponse.json({ message: 'Submission received' });
  } catch (error) {
    console.error('Error saving submission:', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
