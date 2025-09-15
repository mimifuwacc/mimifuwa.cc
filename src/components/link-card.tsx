import Link from "next/link";

export default function LinkCard({ url }: { url: string }) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        {url}
      </div>
    </Link>
  );
}
