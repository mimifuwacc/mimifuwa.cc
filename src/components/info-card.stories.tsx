import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import InfoCard from "./info-card";

const meta = {
  title: "Commons/InfoCard",
  component: InfoCard,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["info", "success", "warning", "dangerous"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof InfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    type: "info",
    children: "This is an info card.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    children: "This is a success card.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    children: "This is a warning card.",
  },
};

export const Dangerous: Story = {
  args: {
    type: "dangerous",
    children: "This is a dangerous card.",
  },
};
