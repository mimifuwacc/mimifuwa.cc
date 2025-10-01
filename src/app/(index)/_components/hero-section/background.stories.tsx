import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Background } from ".";

const meta = {
  title: "Pages/Top/HeroSection/Background",
  component: Background,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[50dvh]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Background>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
