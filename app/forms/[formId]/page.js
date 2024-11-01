export default function FormPage({ params }) {
  const { formId } = params;

  return (
    <div>
      <h1>Form ID: {formId}</h1>
      <iframe
        src={`https://form.jotform.com/${formId}`}
        width="100%"
        height="800px"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
}
