import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Category, SkillItem, skills } from ".";

const meta = {
  title: "Pages/Top/SkillsSection/Category",
  component: Category,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    title: { control: "text" },
    emoji: { control: "text" },
    children: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Category>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Languages",
    emoji: "💻",
    children: (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkillItem
            key={skills.languages[i].name}
            name={skills.languages[i].name}
            image={skills.languages[i].image}
          />
        ))}
      </div>
    ),
  },
};
