import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(relativePath) {
  return readFileSync(resolve(APP_ROOT, relativePath), "utf8");
}

test("legacy email routes remain available but are not scheduled", () => {
  const config = JSON.parse(read("vercel.json"));
  const scheduledPaths = new Set(config.crons.map((cron) => cron.path));

  const retiredEmailRoutes = [
    "/api/cron/soap-opera",
    "/api/cron/challenge",
    "/api/cron/seinfeld",
    "/api/cron/founding",
    "/api/cron/cart-recovery",
    "/api/cron/teardown-courtesy",
  ];

  for (const route of retiredEmailRoutes) {
    const routeFile = resolve(APP_ROOT, `src/app${route}/route.ts`);
    assert.equal(existsSync(routeFile), true, `missing rollback route: ${route}`);
    assert.equal(scheduledPaths.has(route), false, `legacy email cron still scheduled: ${route}`);
  }

  assert.deepEqual(
    [...scheduledPaths].sort(),
    [
      "/api/cron/gsc-feedback",
      "/api/cron/indexnow",
      "/api/cron/llmo-citations",
      "/api/cron/recrawl",
    ].sort(),
  );
});

test("production prebuild enforces the cron safety suite", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(
    pkg.scripts.prebuild,
    /node --test scripts\/test\/unlocksaas-cron-safety\.test\.mjs/,
  );
});
