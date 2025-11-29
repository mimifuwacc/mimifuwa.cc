import Card from "./card";

export interface LinkCardProps {
  url: string;
}

export default function LinkCard({ url }: LinkCardProps) {
  return (
    <Card
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 my-4 pointer-events-none select-none"
      style={{ transition: "none" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-700 font-medium truncate flex-1">
          {url}
        </span>
        <svg
          className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </Card>
  );
}
