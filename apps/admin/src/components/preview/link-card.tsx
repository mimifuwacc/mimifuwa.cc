"use client";

import Link from "next/link";
import useSWR from "swr";

interface OgpData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url: string;
}

const fetcher = async (url: string): Promise<OgpData> => {
  const response = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch OGP data");
  }
  return response.json();
};

export interface LinkCardProps {
  url: string;
}

export default function LinkCard({ url }: LinkCardProps) {
  const {
    data: ogpData,
    error,
    isLoading,
  } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const NoData = () => (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 my-4 border border-slate-200 rounded-lg"
    >
      <span className="text-slate-700 font-medium truncate flex-1">{url}</span>
    </Link>
  );

  if (error) {
    return <NoData />;
  }

  if (!ogpData) {
    if (!isLoading) {
      return <NoData />;
    } else {
      return (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 my-4 flex min-h-[124px] sm:min-h-[146px] w-full border border-slate-200 rounded-lg"
        ></Link>
      );
    }
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 my-4 flex w-full min-h-[122px] sm:min-h-28 border border-slate-200 rounded-lg"
    >
      <div className="flex space-x-4 items-center">
        {ogpData.image && (
          <div className="hidden sm:flex !h-28 aspect-[1.91/1] object-cover rounded-lg bg-slate-100 overflow-hidden shrink-0">
            {/* biome-ignore lint/performance/noImgElement: NextのImageを使うと厄介なので */}
            <img
              src={ogpData.image}
              alt={ogpData.title || ogpData.siteName || ""}
              className=" !my-0 !shadow-none"
              onError={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
            />
          </div>
        )}
        <div>
          {ogpData.siteName && (
            <div className="text-xs text-slate-500 mb-1">
              {ogpData.siteName}
            </div>
          )}
          <div className="text-cyan-600 font-bold line-clamp-2 mb-2">
            {ogpData.title || ogpData.url}
          </div>
          {ogpData.description && (
            <div className="text-sm text-slate-600 line-clamp-3">
              {ogpData.description}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
