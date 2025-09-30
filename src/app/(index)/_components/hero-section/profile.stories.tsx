import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Profile } from ".";

const meta = {
  title: "Pages/Top/HeroSection/Profile",
  component: Profile,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex flex-col text-center items-center justify-center py-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
