import Link from "next/link";

export interface LinkCardProps {
  url: string;
}

export default function LinkCard({ url }: LinkCardProps) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        {url}
      </div>
    </Link>
  );
}
