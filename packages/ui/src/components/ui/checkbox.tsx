"use client";

import { CheckIcon } from "lucide-react";
import {
  Checkbox as CheckboxPrimitive,
  composeRenderProps,
  type CheckboxProps,
} from "react-aria-components";

import { cn } from "../../lib/utils";

function Checkbox({ className, children, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-input transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-selected:border-primary data-selected:bg-primary data-selected:text-primary-foreground",
        className,
      )}
      {...props}
    >
      {composeRenderProps(children, (content, { isSelected, isIndeterminate }) => (
        <>
          <span
            data-slot="checkbox-indicator"
            className="grid place-content-center [&>svg]:size-3.5"
          >
            {(isSelected || isIndeterminate) && <CheckIcon />}
          </span>
          {content}
        </>
      ))}
    </CheckboxPrimitive>
  );
}

export { Checkbox };
