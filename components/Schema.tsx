export default function Schema({ value }: { value: any }) {
  const json = JSON.stringify(value);
  return (
    // Safe to render raw JSON-LD
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
