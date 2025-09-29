import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Timeline } from "./about-section";

const meta = {
  title: "Pages/Top/AboutSection/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
