import { style } from "@vanilla-extract/css";

export const actionButton = style({
  appearance: "none",
  border: 0,
  borderRadius: "999px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  font: "inherit",
  padding: "0.35rem 0.6rem",
  selectors: {
    "&:focus-visible": {
      outline: "2px solid currentColor",
      outlineOffset: "3px",
    },
  },
});
