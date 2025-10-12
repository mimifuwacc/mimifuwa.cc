import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Qualifications } from ".";

const meta = {
  title: "Pages/Top/AboutSection/Qualifications",
  component: Qualifications,
  parameters: {
    layout: "centered",
    previewTabs: {
      "storybook/docs/panel": {
        hidden: true,
      },
    },
  },
} satisfies Meta<typeof Qualifications>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
