import { hobbies } from "@contents/about";
import { ChevronRight, Smile } from "lucide-react";
import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";

export default function Hobby() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Smile className="size-4 text-primary" />
          Hobby
        </h3>
        <div className="h-px bg-border mb-4" />
        <div className="space-y-3">
          {hobbies.map((h) => (
            <div key={h.name} className="space-y-2">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <ChevronRight className="size-3 text-primary shrink-0" />
                {h.name}
              </span>
              {h.items && (
                <div className="flex flex-wrap gap-1.5">
                  {h.items.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
