import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./hero-section";

const meta = {
  title: "Pages/Top/HeroSection/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
