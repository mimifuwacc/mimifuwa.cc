import { certifications } from "@contents/about";
import { Award, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";

export default function Certifications() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Award className="size-4 text-primary" />
          Certifications
        </h3>
        <div className="h-px bg-border mb-4" />
        <div className="space-y-2">
          {certifications.map((c) => (
            <div key={c} className="flex items-center gap-2 text-sm">
              <BadgeCheck className="size-4 text-primary shrink-0" />
              {c}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
