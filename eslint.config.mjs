import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // iCloud 동기화 제외용 실제 폴더 (node_modules, .next는 이 폴더를 가리키는 링크)
    "node_modules.nosync/**",
    ".next.nosync/**",
    // 임시 파일·참고 자료 (git 제외)
    ".tmp/**",
    ".design-ref/**",
    "Claude outputs/**",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/icon/**"],
    rules: {
      // import 순서: code-guide 3장. `npx eslint --fix`로 자동 정렬된다.
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [
            { pattern: "{react,react/**,react-dom,react-dom/**,next,next/**}", group: "external", position: "before" },
            { pattern: "@/components/**", group: "internal", position: "before" },
            { pattern: "@/features/**", group: "internal" },
            { pattern: "@/{lib,hooks,types}/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "object", "type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message:
                "아이콘은 @/components/ui/icon 에서 가져옵니다.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
