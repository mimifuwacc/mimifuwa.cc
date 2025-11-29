import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { works } from "@/contents/works";
import { WorkCard } from "./index";

const meta = {
  title: "Pages/Top/ProjectsSection/WorkCard",
  component: WorkCard,
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
} satisfies Meta<typeof WorkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    work: works[0],
  },
};
