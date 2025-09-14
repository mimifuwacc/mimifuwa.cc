const Configuration = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: "conventional-changelog-atom",
  formatter: "@commitlint/format",

  rules: {
    "header-max-length": [2, "always", 999],
  },

  ignores: [(commit: string) => commit === ""],
  defaultIgnores: true,

  helpUrl:
    "https://github.com/conventional-changelog/commitlint/#what-is-commitlint",

  prompt: {
    messages: {},
    questions: {
      type: {
        description: "Please input type:",
      },
    },
  },
};

export default Configuration;
