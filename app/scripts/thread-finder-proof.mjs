/**
 * Proof runner: executes the thread finder for our own MVPs and writes
 * markdown proof files (internal only, never deployed).
 * Run: node scripts/thread-finder-proof.mjs <name> <problem> <product>
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROOF_DIR = resolve(APP_ROOT, "../../../unlocksaas/proof");

const require = createRequire(import.meta.url);
const ts = require("typescript");
const libSource = readFileSync(
  resolve(APP_ROOT, "src/lib/thread-finder.ts"),
  "utf8"
);
const js = ts.transpileModule(libSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const lib = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);

const [name, problem, product] = process.argv.slice(2);
if (!name || !problem) {
  console.error("usage: node thread-finder-proof.mjs <name> <problem> [product]");
  process.exit(1);
}

const result = await lib.findThreads({
  problem,
  product: product || "",
  limit: 20,
  maxAgeDays: 90,
});

const lines = [];
lines.push(`# Thread finder proof: ${name}`);
lines.push("");
lines.push(`- Generated: ${result.generated_at}`);
lines.push(`- Product: ${product || "(none given)"}`);
lines.push(`- Problem described as: "${problem}"`);
lines.push(`- Queries built: ${result.generated_queries.map((q) => `"${q}"`).join(", ")}`);
lines.push(`- Total fetched: ${result.total_fetched}, returned top ${result.threads.length}`);
lines.push("");
lines.push("## Sources");
lines.push("");
lines.push("| source | ok | fetched | detail |");
lines.push("|---|---|---|---|");
for (const s of result.sources) {
  lines.push(`| ${s.source} | ${s.ok ? "yes" : "NO"} | ${s.threads_fetched} | ${s.detail.replace(/\|/g, "/")} |`);
}
lines.push("");
lines.push("## Top threads");
lines.push("");
for (const t of result.threads) {
  lines.push(`### [${t.score}/100] ${t.title}`);
  lines.push(`- ${t.source_label} · ${t.url}`);
  lines.push(`- ${t.created_at} (${t.age_days}d old) · ${t.engagement_label}`);
  lines.push(`- Score: ${t.score_explanation}`);
  lines.push(`- Why it matches: "${t.matched_quote}"`);
  lines.push(`- Matched terms: ${t.matched_terms.join(", ")}`);
  lines.push("");
}
lines.push("## Notes");
lines.push("");
lines.push("- Reddit public JSON is 403-blocked from the box IP; reported honestly above, not faked.");
lines.push("- This proof is internal (never deployed). The tool never posts anywhere.");

mkdirSync(PROOF_DIR, { recursive: true });
const out = resolve(PROOF_DIR, `${name}.md`);
writeFileSync(out, lines.join("\n") + "\n");
console.log(`wrote ${out}: ${result.threads.length} threads, sources ok: ${result.sources.filter((s) => s.ok).length}/${result.sources.filter((s) => s.source !== "Indie Hackers").length}`);
