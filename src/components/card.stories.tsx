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
    href: {
      control: "text",
      description: "Optional URL for link wrapper",
    },
    target: {
      control: "text",
      description: "Target attribute for link",
    },
    rel: {
      control: "text",
      description: "Rel attribute for link",
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
        <p className="text-slate-600">
          This is a default card with standard styling.
        </p>
      </div>
    ),
  },
};

export const WithLink: Story = {
  args: {
    href: "https://example.com",
    target: "_blank",
    rel: "noopener noreferrer",
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Link Card</h3>
        <p className="text-sm text-slate-600">Click to visit example.com</p>
      </div>
    ),
  },
};

export const CustomStyled: Story = {
  args: {
    className: "bg-gradient-to-r from-cyan-50 to-indigo-50",
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-cyan-800">
          Custom Styled Card
        </h3>
        <p className="text-cyan-600">
          This card demonstrates custom styling possibilities.
        </p>
      </div>
    ),
  },
};
