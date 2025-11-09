import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Timeline } from ".";

const meta = {
  title: "Pages/Top/AboutSection/Timeline",
  component: Timeline,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
