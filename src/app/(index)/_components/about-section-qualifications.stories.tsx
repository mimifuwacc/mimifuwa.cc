import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Qualifications } from "./about-section";

const meta = {
  title: "Pages/Top/AboutSection/Qualifications",
  component: Qualifications,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Qualifications>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
