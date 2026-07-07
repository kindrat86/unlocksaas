#!/usr/bin/env node
/**
 * Fix two issues across the codebase:
 * 1. Add ogLocaleFormat import to [locale]/*.tsx pages
 * 2. Replace pt-BR with pt everywhere (locale rename)
 * 3. Fix inLanguage ternaries that reference pt-BR
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

let patchCount = 0;

function findFiles(dir, exts = [".ts", ".tsx"]) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = findFiles("src");

for (const f of allFiles) {
  let content = readFileSync(f, "utf8");
  let changed = false;

  // 1. Replace pt-BR with pt in locale contexts
  // But NOT in comments that reference historical pt-BR approval dates
  // We need to be selective: replace in code contexts
  
  // Replace "pt-BR" string literals used as locale keys
  if (content.includes('"pt-BR"')) {
    content = content.split('"pt-BR"').join('"pt"');
    changed = true;
  }
  
  // Replace pt-BR in import contexts, type contexts  
  if (content.includes('pt-BR')) {
    // In interface/type positions and case statements
    content = content.replace(/\bpt-BR\b/g, 'pt');
    changed = true;
  }

  // 2. Add ogLocaleFormat import if the file uses it but doesn't import it
  if (content.includes("ogLocaleFormat(") && !content.includes("ogLocaleFormat") || 
      (content.includes("ogLocaleFormat(") && !content.match(/import.*ogLocaleFormat.*from/s))) {
    const importRe = /import \{([^}]+)\} from "@\/lib\/i18n\/locales"/;
    const match = content.match(importRe);
    if (match) {
      const imports = match[1];
      if (!imports.includes("ogLocaleFormat")) {
        content = content.replace(
          importRe,
          `import {${imports}, ogLocaleFormat} from "@/lib/i18n/locales";`
        );
        changed = true;
      }
    } else {
      // No existing import from locales — add one
      // Find the last import line
      const lastImport = content.match(/^import[^\n]+\n/gm);
      if (lastImport) {
        const lastOne = lastImport[lastImport.length - 1];
        content = content.replace(
          lastOne,
          lastOne + 'import { ogLocaleFormat } from "@/lib/i18n/locales";\n'
        );
        changed = true;
      }
    }
  }

  // 3. Fix inLanguage ternary: locale === "pt-BR" ? "pt-BR" : "es"
  // Now it should be: locale
  if (content.includes('locale === "pt" ? "pt" : "es"')) {
    content = content.split('locale === "pt" ? "pt" : "es"').join('locale');
    changed = true;
  }

  if (changed) {
    writeFileSync(f, content);
    patchCount++;
    console.log(`  patched: ${f}`);
  }
}

console.log(`\nTotal files patched: ${patchCount}`);
