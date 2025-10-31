import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GitHubLink } from ".";

const meta = {
  title: "Pages/Top/ProjectsSection/GitHubLink",
  component: GitHubLink,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    username: { control: "text" },
    className: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GitHubLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
