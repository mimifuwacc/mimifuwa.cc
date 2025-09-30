import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AboutSection from ".";

const meta = {
  title: "Pages/Top/AboutSection",
  component: AboutSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AboutSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
