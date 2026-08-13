import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { cn } from "@mimifuwacc/ui/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@mimifuwacc/ui/components/ui/alert";

export type InfoType = "info" | "success" | "warning" | "dangerous";

const infoThemes: Record<
  InfoType,
  {
    icon: React.ElementType;
    bg: string;
    titleColor: string;
    label: string;
  }
> = {
  info: {
    icon: FaCircleInfo,
    bg: "bg-primary/10 border-primary/30 [&>svg]:text-primary",
    titleColor: "text-primary",
    label: "INFO",
  },
  success: {
    icon: FaCircleCheck,
    bg: "bg-green-500/10 border-green-500/30 [&>svg]:text-green-600",
    titleColor: "text-green-600",
    label: "SUCCESS",
  },
  warning: {
    icon: FaTriangleExclamation,
    bg: "bg-amber-500/10 border-amber-500/30 [&>svg]:text-amber-600",
    titleColor: "text-amber-600",
    label: "WARNING",
  },
  dangerous: {
    icon: FaCircleExclamation,
    bg: "bg-destructive/10 border-destructive/30 [&>svg]:text-destructive",
    titleColor: "text-destructive",
    label: "DANGER",
  },
};

export function InfoCard({ type, children }: { type: InfoType; children?: React.ReactNode }) {
  const t = infoThemes[type] ?? infoThemes.info;
  const Icon = t.icon;
  return (
    <Alert className={cn("my-4 px-4 py-3.5", t.bg)}>
      <Icon className="size-4 mt-0.5" />
      <AlertTitle className={cn("text-sm font-semibold", t.titleColor)}>{t.label}</AlertTitle>
      <AlertDescription className="text-sm leading-relaxed">{children}</AlertDescription>
    </Alert>
  );
}
