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
}: SwitchProps & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-input transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-[18px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        className,
      )}
      {...props}
    >
      {composeRenderProps(children, (content, { isSelected }) => (
        <>
          <span
            data-slot="switch-thumb"
            data-selected={isSelected || undefined}
            className="pointer-events-none block size-4 rounded-full bg-background shadow-sm transition-transform group-data-[size=sm]/switch:size-3 data-selected:translate-x-[calc(100%-2px)]"
          />
          {content}
        </>
      ))}
    </SwitchPrimitive>
  );
}

export { Switch };
