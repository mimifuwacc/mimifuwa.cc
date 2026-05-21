import { useQuery } from "@tanstack/react-query";

interface OgpData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

async function fetchOgp(url: string): Promise<OgpData> {
  const response = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error("Failed to fetch OGP data");
  return response.json();
}

export interface LinkCardProps {
  url: string;
}

export default function LinkCard({ url }: LinkCardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["ogp", url],
    queryFn: () => fetchOgp(url),
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex my-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors overflow-hidden no-underline"
    >
      <div className="flex flex-col justify-center flex-1 min-w-0 px-4 py-3 gap-1">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground line-clamp-1 leading-snug">
              {(!isError && data?.title) ? data.title : hostname}
            </p>
            {!isError && data?.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {data.description}
              </p>
            )}
            <p className="text-xs text-primary truncate mt-0.5">{hostname}</p>
          </>
        )}
      </div>

      {!isLoading && !isError && data?.image && (
        <div className="hidden sm:block w-32 shrink-0 self-stretch">
          <img
            src={data.image}
            alt={data.title ?? ""}
            className="!my-0 !rounded-none !shadow-none !border-none w-full h-full object-cover"
            onError={(e) => { e.currentTarget.parentElement?.remove(); }}
          />
        </div>
      )}
    </a>
  );
}
