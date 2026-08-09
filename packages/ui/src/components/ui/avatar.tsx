"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm" | "lg";
}) {
  return (
    <div
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border data-[size=lg]:size-10 data-[size=sm]:size-6",
        className,
      )}
      {...props}
    />
  );
}

type ImageState = "loading" | "loaded" | "error";

function AvatarImage({ className, onError, onLoad, ...props }: React.ComponentProps<"img">) {
  const [state, setState] = React.useState<ImageState>(props.src ? "loading" : "error");
  return (
    <img
      data-slot="avatar-image"
      data-state={state}
      alt={props.alt ?? ""}
      onLoad={(event) => {
        setState("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setState("error");
        onError?.(event);
      }}
      className={cn(
        "peer aspect-square size-full rounded-full object-cover data-[state=error]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground peer-data-[state=error]:flex peer-[*]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 rounded-full bg-primary ring-2 ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="avatar-group" className={cn("flex -space-x-2", className)} {...props} />;
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 items-center justify-center rounded-full bg-muted text-sm ring-2 ring-background",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage };
