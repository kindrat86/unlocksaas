#!/usr/bin/env node
/**
 * Patch all i18n-related files for 97-locale support.
 * 1. Record<Locale, X> → Partial<Record<Locale, X>> in translation files
 * 2. STEMS direct access → fallback in paa-questions.ts
 * 3. Hardcoded og:locale ternaries → ogLocaleFormat(locale)
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const SRC = "src";
let patchCount = 0;

function patchFile(filePath, replacements) {
  let content = readFileSync(filePath, "utf8");
  let changed = false;
  for (const [old, replacement, isRegex] of replacements) {
    if (isRegex) {
      const re = new RegExp(old, "g");
      if (re.test(content)) {
        content = content.replace(re, replacement);
        changed = true;
      }
    } else {
      if (content.includes(old)) {
        content = content.split(old).join(replacement);
        changed = true;
      }
    }
  }
  if (changed) {
    writeFileSync(filePath, content);
    patchCount++;
    console.log(`  patched: ${filePath}`);
  }
}

// 1. Translation files: Record<Locale, X> → Partial<Record<Locale, X>>
const translationFiles = [
  "src/lib/i18n/translations/index.ts",
  "src/lib/i18n/translations/pseo-chrome.ts",
  "src/lib/seo/paa-questions.ts",
];

for (const f of translationFiles) {
  patchFile(f, [
    ["Record<Locale, PageChromePseoShared>", "Partial<Record<Locale, PageChromePseoShared>>"],
    ["Record<Locale, PageChromeFaq>", "Partial<Record<Locale, PageChromeFaq>>"],
    ["Record<Locale, PageChromeContact>", "Partial<Record<Locale, PageChromeContact>>"],
    ["Record<Locale, PageChromeRepeatable>", "Partial<Record<Locale, PageChromeRepeatable>>"],
    ["Record<Locale, PageChromeGlossary>", "Partial<Record<Locale, PageChromeGlossary>>"],
    ["Record<Locale, PageChromeBenchmarks>", "Partial<Record<Locale, PageChromeBenchmarks>>"],
    ["Record<Locale, PageChromePseoCluster>", "Partial<Record<Locale, PageChromePseoCluster>>"],
    ["const STEMS: Record<Locale, PaaStems>", "const STEMS: Partial<Record<Locale, PaaStems>>"],
  ]);
}

// 2. Fix STEMS direct access in paa-questions.ts
patchFile("src/lib/seo/paa-questions.ts", [
  ["return STEMS[locale].heading;", "return STEMS[locale]?.heading ?? STEMS[\"en-US\"].heading;"],
]);

// 3. Fix paaForGlossary and paaForBenchmark STEMS access
patchFile("src/lib/seo/paa-questions.ts", [
  ["const s = STEMS[locale];", "const s = STEMS[locale] ?? STEMS[\"en-US\"];"],
]);

// 4. Fix all og:locale ternaries → ogLocaleFormat(locale)
// Pattern: locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US"
const ogOld = 'locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US"';

// Find all [locale] page files and patch them
const localePagesDir = "src/app/[locale]";
function findPageFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath));
    } else if (entry.name === "page.tsx" || entry.name === "layout.tsx") {
      results.push(fullPath);
    }
  }
  return results;
}

// First, add the import to each file, then replace the ternary
const localeFiles = findPageFiles(localePagesDir);
localeFiles.push("src/app/[locale]/layout.tsx");

for (const f of localeFiles) {
  let content = readFileSync(f, "utf8");
  let changed = false;

  // Replace the ternary with ogLocaleFormat(locale)
  if (content.includes(ogOld)) {
    content = content.split(ogOld).join("ogLocaleFormat(locale)");
    changed = true;
  }

  // Add import if we made changes and it's not already imported
  if (changed && !content.includes("ogLocaleFormat")) {
    // Find the import from locales
    const importRe = /import \{([^}]+)\} from "@\/lib\/i18n\/locales";/;
    const match = content.match(importRe);
    if (match) {
      const imports = match[1];
      if (!imports.includes("ogLocaleFormat")) {
        content = content.replace(
          importRe,
          `import {${imports}, ogLocaleFormat} from "@/lib/i18n/locales";`
        );
      }
    }
  }

  if (changed) {
    writeFileSync(f, content);
    patchCount++;
    console.log(`  patched og:locale: ${f}`);
  }
}

console.log(`\nTotal files patched: ${patchCount}`);
