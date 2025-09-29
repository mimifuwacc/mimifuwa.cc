import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeroSection from "./hero-section";

const meta = {
  title: "Pages/Top/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
