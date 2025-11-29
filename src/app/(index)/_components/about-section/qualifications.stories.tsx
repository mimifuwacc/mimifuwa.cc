import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Certifications } from ".";

const meta = {
  title: "Pages/Top/AboutSection/Qualifications",
  component: Certifications,
  parameters: {
    layout: "centered",
    previewTabs: {
      "storybook/docs/panel": {
        hidden: true,
      },
    },
  },
} satisfies Meta<typeof Certifications>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
