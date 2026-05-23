"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

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

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  const hasImage = !isLoading && !isError && !!data?.image;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-stretch my-6 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors overflow-hidden no-underline group"
    >
      <div className="flex flex-col justify-center flex-1 min-w-0 px-5 py-4 gap-1.5">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-1/4 rounded-md bg-muted animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors">
              {!isError && data?.title ? data.title : hostname}
            </p>
            {!isError && data?.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {data.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <img
                src={faviconUrl}
                alt=""
                className="!my-0 !shadow-none !border-none !rounded-none size-3 opacity-70"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="text-[11px] text-muted-foreground/70 truncate">{hostname}</p>
              <ExternalLink className="size-2.5 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        )}
      </div>

      {hasImage && (
        <div className="hidden sm:flex items-center pr-4 shrink-0">
          <img
            src={data!.image}
            alt={data!.title ?? ""}
            className="!my-0 !shadow-none !border-none max-w-36 max-h-20 w-auto h-auto object-contain rounded-sm border border-border"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement)?.remove();
            }}
          />
        </div>
      )}
    </a>
  );
}
