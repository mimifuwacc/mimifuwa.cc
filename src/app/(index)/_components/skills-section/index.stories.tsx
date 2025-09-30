import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SkillsSection from ".";

const meta = {
  title: "Pages/Top/SkillsSection",
  component: SkillsSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SkillsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
