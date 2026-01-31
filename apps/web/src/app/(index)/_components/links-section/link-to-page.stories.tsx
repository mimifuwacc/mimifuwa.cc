import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LinkToPage } from "./index";

const meta = {
  title: "Pages/Top/LinksSection/LinkToPage",
  component: LinkToPage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    link: {
      control: "object",
      description:
        "Link item data containing name, url, description, and optional image",
    },
  },
} satisfies Meta<typeof LinkToPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    link: {
      name: "サンプル",
      url: "https://example.com",
      description: "サンプル人間。Reactを触っている技術が強い人。",
    },
  },
};
