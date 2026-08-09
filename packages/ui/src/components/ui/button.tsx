"use client";

import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import {
  Button as ButtonPrimitive,
  Link as LinkPrimitive,
  type ButtonProps,
  type LinkProps,
} from "react-aria-components";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button-variants";

type ButtonVariantProps = VariantProps<typeof buttonVariants> & { className?: string };
type ButtonCompatibilityProps = {
  /** @deprecated Prefer React Aria's `isDisabled`. */
  disabled?: boolean;
  /** Prefer a visible label or `aria-label` for accessible naming. */
  title?: string;
};

function Button({
  className,
  variant = "default",
  size = "default",
  disabled,
  title,
  isDisabled,
  "aria-label": ariaLabel,
  ...props
}: Omit<ButtonProps, "className"> &
  React.RefAttributes<HTMLButtonElement> &
  ButtonVariantProps &
  ButtonCompatibilityProps) {
  return (
    <ButtonPrimitive
      {...props}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      {...({ title } as { title?: string })}
      aria-label={ariaLabel ?? title}
      isDisabled={isDisabled ?? disabled}
      className={cn(buttonVariants({ variant, size, className }))}
    />
  );
}

function LinkButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: Omit<LinkProps, "className"> & ButtonVariantProps) {
  return (
    <LinkPrimitive
      {...props}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
    />
  );
}

export { Button, LinkButton };
