import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BlogCard } from "../blogs-section";

const meta = {
  title: "Pages/Top/BlogsSection/BlogCard",
  component: BlogCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BlogCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPost = {
  slug: "react-performance-tips",
  title: "Reactアプリケーションのパフォーマンス改善チップス",
  excerpt:
    "Reactアプリのパフォーマンスを改善するための実践的なテクニックを紹介します。メモ化、最適化レンダリング、コード分割など。",
  date: "2024-01-15",
  tags: ["React", "パフォーマンス", "フロントエンド"],
};

export const Default: Story = {
  args: {
    post: mockPost,
  },
};

export const LongTitle: Story = {
  args: {
    post: {
      ...mockPost,
      title:
        "Reactアプリケーションのパフォーマンス改善チップス：メモ化、最適化レンダリング、コード分割などの高度なテクニックを詳しく解説",
    },
  },
};

export const ManyTags: Story = {
  args: {
    post: {
      ...mockPost,
      tags: [
        "React",
        "パフォーマンス",
        "フロントエンド",
        "JavaScript",
        "Web開発",
        "プログラミング",
        "チュートリアル",
      ],
    },
  },
};
