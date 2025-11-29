import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "./section";

const meta = {
  title: "Pages/Top/Section",
  component: Section,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    id: {
      control: "text",
      description: "Section ID for navigation",
    },
    title: {
      control: "text",
      description: "Section title",
    },
    subtitle: {
      control: "text",
      description: "Section subtitle",
    },
    icon: {
      control: "text",
      description: "Section icon (emoji)",
    },
    bg: {
      control: "select",
      options: ["gray", "white", "none"],
      description: "Background color variant",
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
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "default-section",
    title: "セクションタイトル",
    subtitle: "これはセクションのサブタイトルです",
    icon: "📝",
    bg: "gray",
    children: (
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">コンテンツ1</h3>
            <p className="text-slate-600">
              これはセクション内のコンテンツ例です。Sectionコンポーネントは、汎用的なセクションコンテナとして使用できます。
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">コンテンツ2</h3>
            <p className="text-slate-600">
              背景色やパディングを簡単に変更できます。
            </p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">サイドコンテンツ</h3>
          <p className="text-slate-600">
            グリッドレイアウトにも対応しています。
          </p>
        </div>
      </div>
    ),
  },
};
