import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { works } from "@/contents/works";
import { ProjectCard } from "./index";

const meta = {
  title: "Pages/Top/ProjectsSection/ProjectCard",
  component: ProjectCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    work: {
      control: "object",
      description: "Project data",
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    work: works[0],
  },
};
