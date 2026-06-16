import { timelineData } from "@contents/about";
import { Clock } from "lucide-react";
import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";

export default function Timeline() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          Timeline
        </h3>
        <div className="h-px bg-border mb-5" />
        {/* ドット中心 = left-[5.5px]（11px幅の半分）、ラインも left-[5.5px] で一致 */}
        <div className="relative">
          <div className="absolute left-[5.5px] top-0 bottom-0 w-px bg-border" />
          <svg
            className="absolute bottom-0 left-0 w-3 text-border"
            viewBox="0 0 12 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 0 L6 6 L12 0"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {timelineData.map((event) => (
            <div key={`${event.date}-${event.title}`} className="relative pl-6 pb-7 last:pb-8">
              <div className="absolute left-0 top-[3px] w-3 h-3 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20" />
              <Badge
                variant="outline"
                className="mb-1.5 text-xs text-primary border-primary/40 bg-primary/5"
              >
                {event.date}
              </Badge>
              <h4 className="text-sm font-semibold leading-snug mb-1">{event.title}</h4>
              {event.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
