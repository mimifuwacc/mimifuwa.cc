import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Footer from "./footer";

const meta = {
  title: "Commons/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    year: {
      control: "number",
      description: "Copyright year to display",
    },
    author: {
      control: "text",
      description: "Author name to display in copyright",
    },
    showSocialLinks: {
      control: "boolean",
      description: "Whether to show social media links",
    },
    footerLinks: {
      control: "object",
      description: "Array of footer navigation links",
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    year: 2024,
    author: "mimifuwacc",
    showSocialLinks: true,
    footerLinks: [
      { href: "/", label: "ホーム" },
      { href: "/blogs", label: "ブログ" },
      { href: "/links", label: "相互リンク" },
    ],
  },
};

export const WithoutSocialLinks: Story = {
  args: {
    year: 2024,
    author: "mimifuwacc",
    showSocialLinks: false,
    footerLinks: [
      { href: "/", label: "ホーム" },
      { href: "/blogs", label: "ブログ" },
      { href: "/links", label: "相互リンク" },
    ],
  },
};

export const CustomYear: Story = {
  args: {
    year: 2025,
    author: "mimifuwacc",
    showSocialLinks: true,
    footerLinks: [
      { href: "/", label: "ホーム" },
      { href: "/blogs", label: "ブログ" },
      { href: "/links", label: "相互リンク" },
    ],
  },
};

export const MinimalLinks: Story = {
  args: {
    year: 2024,
    author: "mimifuwacc",
    showSocialLinks: true,
    footerLinks: [
      { href: "/", label: "ホーム" },
      { href: "/blogs", label: "ブログ" },
    ],
  },
};

export const CustomAuthor: Story = {
  args: {
    year: 2024,
    author: "John Doe",
    showSocialLinks: true,
    footerLinks: [
      { href: "/", label: "ホーム" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
};
