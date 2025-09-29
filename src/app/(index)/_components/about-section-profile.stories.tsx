import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Profile } from "./about-section";

const meta = {
  title: "Pages/Top/AboutSection/Profile",
  component: Profile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
