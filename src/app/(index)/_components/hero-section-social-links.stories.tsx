import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SocialLinks } from "./hero-section";

const meta = {
  title: "Pages/Top/HeroSection/SocialLinks",
  component: SocialLinks,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="py-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SocialLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
