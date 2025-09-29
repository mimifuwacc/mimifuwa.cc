import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./card";

const meta = {
  title: "Commons/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    url: {
      control: "text",
      description: "Optional URL for link wrapper",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    children: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Default Card</h3>
        <p className="text-gray-600">
          This is a default card with standard styling.
        </p>
      </div>
    ),
  },
};

export const WithLink: Story = {
  args: {
    url: "https://example.com",
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Link Card</h3>
        <p className="text-sm text-gray-600">Click to visit our about page</p>
      </div>
    ),
  },
};

export const CustomStyled: Story = {
  args: {
    className: "bg-gradient-to-r from-blue-50 to-indigo-50",
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-blue-800">
          Custom Styled Card
        </h3>
        <p className="text-blue-600">
          This card demonstrates custom styling possibilities.
        </p>
      </div>
    ),
  },
};
