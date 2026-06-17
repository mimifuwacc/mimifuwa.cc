import { allSkills } from "@contents/skills";
import { Wrench } from "lucide-react";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";

export default function Skills() {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Wrench className="size-4 text-primary" />
          Skills
        </h3>
        <div className="h-px bg-border mb-4" />
        <div className="grid grid-cols-8 gap-3">
          {allSkills.map((skill) => (
            <div
              key={skill.name}
              className="group flex items-center justify-center"
              title={skill.name}
            >
              <img src={skill.image} alt={skill.name} className="w-full max-w-[28px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
