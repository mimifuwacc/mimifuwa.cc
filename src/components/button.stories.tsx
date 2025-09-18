import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FaCircleInfo, FaGithub, FaPlay } from "react-icons/fa6";
import Button from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "ghost", "destructive", "success"],
      description: "Button variant",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
      description: "Button size",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    icon: {
      control: "select",
      options: ["info", "github", "play", null],
      mapping: {
        info: <FaCircleInfo />,
        github: <FaGithub />,
        play: <FaPlay />,
      },
    },
    text: { control: "text", defaultValue: "Click Me" },
    url: { control: "text", defaultValue: "" },
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Click Me",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    text: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    text: "Ghost",
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    text: "Delete",
    variant: "destructive",
  },
};

export const Success: Story = {
  args: {
    text: "Success",
    variant: "success",
  },
};

export const WithIcon: Story = {
  args: {
    text: "Learn More",
    icon: "info",
    variant: "default",
  },
};

export const Small: Story = {
  args: {
    text: "Small",
    size: "sm",
    variant: "default",
  },
};

export const Large: Story = {
  args: {
    text: "Large",
    size: "lg",
    variant: "default",
  },
};

export const Disabled: Story = {
  args: {
    text: "Disabled",
    disabled: true,
    variant: "default",
  },
};

export const WithURL: Story = {
  args: {
    text: "Visit GitHub",
    icon: "github",
    url: "https://github.com",
    variant: "secondary",
  },
};

export const WithOnClick: Story = {
  args: {
    text: "Click Me",
    icon: "play",
    onClick: () => alert("Button clicked!"),
    variant: "success",
  },
};
