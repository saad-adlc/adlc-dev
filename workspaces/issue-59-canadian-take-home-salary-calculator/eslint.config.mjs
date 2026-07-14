import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
export default tseslint.config(
  { ignores: ['dist', 'coverage', '*.config.ts', 'eslint.config.mjs'] },
  js.configs.recommended, ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser } },
    // WS8 Orix rule, hard-gated (measured): max file size 300 lines. The stricter Orix
    // rules (<=40 lines/fn, no-magic-numbers, kebab-case, no inline styles) ride the
    // generate prompt + the reviewer for now (eslint --max-warnings 0 has no advisory
    // tier), and get promoted to hard lint once a real generate proves the agent complies.
    rules: { 'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }] } },
);
