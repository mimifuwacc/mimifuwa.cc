import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

import { fonts } from "../src/lib/fonts";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${fonts.map((font) => font.variable).join(" ")}`}>
        <div className="font-normal text-slate-700">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
