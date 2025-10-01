import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SkillItem, skills } from ".";

const meta = {
  title: "Pages/Top/SkillsSection/SkillItem",
  component: SkillItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    name: { control: "text" },
    image: { control: "text" },
  },
} satisfies Meta<typeof SkillItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: skills.languages[0].name,
    image: skills.languages[0].image,
  },
};
