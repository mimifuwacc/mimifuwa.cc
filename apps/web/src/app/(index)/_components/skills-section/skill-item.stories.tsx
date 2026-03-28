import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { allSkills } from "@/contents/skills";
import { SkillCard } from ".";

const meta = {
  title: "Pages/Top/SkillsSection/SkillCard",
  component: SkillCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    name: { control: "text" },
    image: { control: "text" },
  },
} satisfies Meta<typeof SkillCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: allSkills[0].name,
    image: allSkills[0].image,
  },
};
