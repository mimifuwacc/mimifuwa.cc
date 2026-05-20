import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";

const themes = {
  info: {
    icon: FaCircleInfo,
    headingColor: "text-cyan-500",
    textColor: "text-cyan-900",
    bgColor: "bg-cyan-50",
    borderColor: "bg-cyan-500",
  },
  success: {
    icon: FaCircleCheck,
    headingColor: "text-green-500",
    textColor: "text-green-900",
    bgColor: "bg-green-50",
    borderColor: "bg-green-500",
  },
  warning: {
    icon: FaTriangleExclamation,
    headingColor: "text-yellow-500",
    textColor: "text-yellow-900",
    bgColor: "bg-yellow-50",
    borderColor: "bg-yellow-500",
  },
  dangerous: {
    icon: FaCircleExclamation,
    headingColor: "text-red-500",
    textColor: "text-red-900",
    bgColor: "bg-red-50",
    borderColor: "bg-red-500",
  },
};

export interface InfoCardProps {
  type: keyof typeof themes;
  children: React.ReactNode;
}

export default function InfoCard({ type, children }: InfoCardProps) {
  const theme = themes[type] ?? themes.info;
  const Icon = theme.icon;
  return (
    <div className={`info-card flex ${theme.bgColor} my-4 rounded-lg overflow-clip`}>
      <div className={`w-1.5 ${theme.borderColor}`} />
      <div className="p-4 w-full">
        <div className={`flex gap-x-2 items-center font-bold ${theme.headingColor}`}>
          <Icon />
          {type.toUpperCase()}
        </div>
        <div className={theme.textColor}>{children}</div>
      </div>
    </div>
  );
}
