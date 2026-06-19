#!/usr/bin/env bash
# ADLC deterministic pre-agent prep for the gh-aw generate workflow.
# Slug is BYTE-IDENTICAL to the hand-rolled adlc-generate.yml (HANDOFF §3/§12.1).
# Fallback B (default): scaffold + status are written but LEFT UNCOMMITTED; the
# agent's single `git add "$ADLC_WORKSPACE"` stages them with its own work into
# one commit that is guaranteed in the create-pull-request bundle. No early push.
set -uo pipefail

adlc_slug() {  # <issue> <title> -> "issue-<N>-<kebab>"
  local issue="$1" title="$2" kebab
  kebab=$(printf '%s' "$title" | LC_ALL=C tr '[:upper:]' '[:lower:]' \
    | LC_ALL=C sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
  if [ "${#kebab}" -gt 40 ]; then
    kebab="${kebab:0:40}"; kebab=$(printf '%s' "$kebab" | sed -E 's/-[^-]*$//; s/-+$//')
  fi
  [ -z "$kebab" ] && kebab="feature"
  printf 'issue-%s-%s' "$issue" "$kebab"
}

write_status() {  # <ws> <stage> <detail> [pr]
  local ws="$1" stage="$2" detail="$3" pr="${4:-null}"
  mkdir -p "${ws}/.adlc"
  cat > "${ws}/.adlc/status.json" <<JSON
{ "stage": "${stage}", "iteration": 0, "pr": ${pr}, "preview_url": null,
  "detail": "${detail}", "updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" }
JSON
}

# Allow tests to source functions without running main.
case "${1:-}" in --source-only) return 0 2>/dev/null || exit 0 ;; esac

main() {
  : "${ISSUE_NUMBER:?}"; : "${ISSUE_TITLE:?}"; : "${STANDARDS_REPO:?}"; : "${STANDARDS_TOKEN:?}"
  local slug branch ws
  slug="$(adlc_slug "$ISSUE_NUMBER" "$ISSUE_TITLE")"
  branch="feature/${slug}"; ws="workspaces/${slug}"

  git config user.name "adlc-agent"
  git config user.email "adlc-agent@saad-adlc.com"
  git checkout -b "$branch"

  # --- scaffold workspaces/<slug>/ (identical to hand-rolled) ---
  mkdir -p "${ws}/src"
  cat > "${ws}/package.json" <<EOF
{
  "name": "${slug}", "private": true, "version": "0.0.0", "type": "module",
  "scripts": {
    "dev": "vite", "build": "vite build", "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0", "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "ci": "npm run typecheck && npm run lint && npm run test:coverage"
  },
  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1" },
  "devDependencies": {
    "@eslint/js": "^9.15.0", "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.1", "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1", "@vitejs/plugin-react": "^4.3.3",
    "@vitest/coverage-v8": "^2.1.5", "eslint": "^9.15.0", "globals": "^15.12.0",
    "jsdom": "^25.0.1", "typescript": "^5.6.3", "typescript-eslint": "^8.15.0",
    "vite": "^5.4.11", "vitest": "^2.1.5"
  }
}
EOF
  cat > "${ws}/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020", "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext",
    "skipLibCheck": true, "moduleResolution": "bundler", "resolveJsonModule": true,
    "isolatedModules": true, "moduleDetection": "force", "noEmit": true,
    "jsx": "react-jsx", "strict": true, "noUnusedLocals": true,
    "noUnusedParameters": true, "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
EOF
  cat > "${ws}/vite.config.ts" <<'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, environment: 'jsdom', setupFiles: ['./src/test-setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov', 'json-summary'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      exclude: ['**/main.tsx', '**/*.config.*', '**/dist/**', '**/coverage/**'] },
  },
});
EOF
  cat > "${ws}/eslint.config.mjs" <<'EOF'
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
export default tseslint.config(
  { ignores: ['dist', 'coverage', '*.config.ts', 'eslint.config.mjs'] },
  js.configs.recommended, ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { ...globals.browser } } },
);
EOF
  cat > "${ws}/index.html" <<EOF
<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${slug}</title></head>
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF
  printf "import '@testing-library/jest-dom';\n" > "${ws}/src/test-setup.ts"
  cat > "${ws}/src/main.tsx" <<'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
EOF
  printf '/** App — root component. */\nexport default function App() {\n  return <div id="app" />;\n}\n' > "${ws}/src/App.tsx"

  ( cd "$ws" && npm install )

  # --- mount standards + deny hook + Spec-Kit templates, kept OUT of the agent's commit ---
  git clone --depth 1 "https://x-access-token:${STANDARDS_TOKEN}@github.com/${STANDARDS_REPO}.git" .adlc-standards
  mkdir -p .claude/hooks .speckit
  cp .adlc-standards/hooks/pretooluse-deny.sh .claude/hooks/pretooluse-deny.sh
  chmod +x .claude/hooks/pretooluse-deny.sh
  cp .adlc-standards/hooks/settings.template.json .claude/settings.json
  cp .adlc-standards/constitution.md ./constitution.md
  cp -r .adlc-standards/steering ./steering
  cp .adlc-standards/vendor/spec-kit/templates/spec-template.md  .speckit/spec-template.md
  cp .adlc-standards/vendor/spec-kit/templates/plan-template.md  .speckit/plan-template.md
  cp .adlc-standards/vendor/spec-kit/templates/tasks-template.md .speckit/tasks-template.md
  printf '%s\n' '.adlc-standards/' '.claude/' 'constitution.md' 'steering/' '.speckit/' >> .git/info/exclude

  # --- status scaffolding, written but LEFT UNCOMMITTED (Fallback B = default) ---
  # The agent's single `git add "$ADLC_WORKSPACE"` will stage the scaffold + this
  # status.json + its own src into ONE agent-authored commit, which is guaranteed
  # to be in the create-pull-request bundle. We do NOT push the branch here:
  # gh-aw bundles origin/<branch>..<branch>, so any early-pushed commit would be
  # EXCLUDED from the PR (verified: generate_git_bundle.cjs). No early push, no
  # branch collision, no recreate-ref rename risk.
  write_status "$ws" "scaffolding" "Workspace created, dependencies installed"

  { echo "ADLC_BRANCH=${branch}"; echo "ADLC_WORKSPACE=${ws}"; echo "ADLC_SLUG=${slug}"; } >> "$GITHUB_ENV"
  echo "Prepared ${branch} / ${ws} (scaffold uncommitted; agent commits it)"
}

main "$@"
