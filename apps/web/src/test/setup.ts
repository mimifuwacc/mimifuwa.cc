import { vi } from "vitest";

Object.defineProperty(global, "fetch", {
  value: vi.fn(),
  writable: true,
});
