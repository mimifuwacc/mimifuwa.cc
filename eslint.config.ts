import astro from "eslint-plugin-astro";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.astro/**",
      "**/.wrangler/**",
      "**/.open-next/**",
    ],
  },
  ...astro.configs["flat/recommended"],
];
