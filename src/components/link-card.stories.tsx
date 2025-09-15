import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import LinkCard from "./link-card";

const meta = {
  title: "Components/LinkCard",
  component: LinkCard,
  tags: ["autodocs"],
  argTypes: {
    url: { control: "text" },
  },
} satisfies Meta<typeof LinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    url: "https://example.com",
  },
};
