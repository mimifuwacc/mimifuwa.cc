"use client";

import {
  composeRenderProps,
  Switch as SwitchPrimitive,
  type SwitchProps,
} from "react-aria-components";

import { cn } from "../../lib/utils";

function Switch({
  className,
  size = "default",
  children,
  ...props
}: Omit<SwitchProps, "className"> & {
  className?: string;
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex items-center gap-2 outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {composeRenderProps(children, (content, { isSelected }) => (
        <>
          <span
            data-slot="switch-track"
            data-selected={isSelected || undefined}
            className="relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-input transition-all group-focus-visible/switch:border-ring group-focus-visible/switch:ring-3 group-focus-visible/switch:ring-ring/50 data-selected:bg-primary group-data-[size=default]/switch:h-[18px] group-data-[size=default]/switch:w-8 group-data-[size=sm]/switch:h-3.5 group-data-[size=sm]/switch:w-6"
          >
            <span
              data-slot="switch-thumb"
              data-selected={isSelected || undefined}
              className="pointer-events-none block size-4 rounded-full bg-background shadow-sm transition-transform group-data-[size=sm]/switch:size-3 data-selected:translate-x-[calc(100%-2px)]"
            />
          </span>
          {content}
        </>
      ))}
    </SwitchPrimitive>
  );
}

export { Switch };
