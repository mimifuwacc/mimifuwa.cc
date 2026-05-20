export default function ContentRenderer({ html }: { html: string }) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: APIが生成した信頼できるHTML
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
