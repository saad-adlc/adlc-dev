import { defineConfig } from "eslint/config";
import markdown from "@eslint/markdown";

export default defineConfig([
  {
    files: ["**/*.md"],
    plugins: { markdown },
    extends: ["markdown/recommended"],
    rules: {
      "markdown/no-html": "error",
      "markdown/no-duplicate-headings": "error"
    }
  }
]);
