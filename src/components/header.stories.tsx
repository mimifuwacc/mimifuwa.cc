import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Header from "./header";

const meta = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    path: {
      control: "text",
      description: "Current path for active link highlighting",
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    path: "/",
  },
};

export const BlogsPage: Story = {
  args: {
    path: "/blogs",
  },
};
