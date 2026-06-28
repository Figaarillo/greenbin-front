import config from "eslint-config-standard";

export default [
  ...[].concat(config),
  {
    rules: {
      indent: ["error", 2],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "single"],
      semi: ["error", "never"],
      eqeqeq: "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],
      "no-console": [
        "warn",
        {
          allow: ["error"],
        },
      ],
      "space-before-function-paren": ["error", "always"],
      "max-len": "off",
      "object-curly-spacing": ["error", "always"],
    },
  },
];
