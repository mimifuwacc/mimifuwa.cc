import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hobby } from ".";

const meta = {
  title: "Pages/Top/AboutSection/Hobby",
  component: Hobby,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Hobby>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
