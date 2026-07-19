#!/usr/bin/env node
/**
 * Postbuild patcher: fixes CSP override for embeddable widget routes.
 *
 * PROBLEM: Next.js generates a terminal catch-all route (src: ^(?:/(.*))$)
 * that includes the strict baseline CSP (frame-ancestors 'none'). This
 * terminal route OVERWRITES the CSP set by the continue:true embed override
 * routes, so all /embed/*, /network/*, /widgets/* widgets are served with
 * frame-ancestors 'none' — making them un-embeddable and killing the entire
 * editorial backlink farm.
 *
 * FIX: Remove Content-Security-Policy and X-Frame-Options from the terminal
 * catch-all route. The continue:true routes ([28] baseline + [31-33] embed
 * overrides) still inject CSP. For embed paths, the embed override (later in
 * the route list) wins via Vercel's later-wins merging. For all other paths,
 * the baseline CSP from the continue:true catch-all still applies.
 *
 * This runs as `next build`'s postbuild step (see package.json postbuild).
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), ".vercel", "output", "config.json");

let config;
try {
  config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
} catch {
  console.log("[postbuild-csp] No .vercel/output/config.json found — skipping");
  process.exit(0);
}

const routes = config.routes || [];
let patched = 0;

for (const route of routes) {
  if (!route || typeof route !== "object") continue;
  const src = route.src || "";
  const headers = route.headers;
  if (!headers || typeof headers !== "object") continue;

  // Target: the FINAL strict catch-all ^(?:/(.*))$ — this is the route that
  // overwrites embed CSP overrides. It may have continue:true or be terminal;
  // either way, its CSP wins over the embed-specific override routes for
  // /embed/* paths (later route wins in Vercel's header merging).
  // Stripping CSP here lets the embed override routes [31-33] be the final
  // authority for embed paths, while the continue:true baseline catch-all
  // [28] still injects strict CSP for all other paths.
  if (src === "^(?:/(.*))$") {
    if (headers["Content-Security-Policy"]) {
      delete headers["Content-Security-Policy"];
      patched++;
    }
    if (headers["X-Frame-Options"]) {
      delete headers["X-Frame-Options"];
      patched++;
    }
  }
}

if (patched > 0) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`[postbuild-csp] Removed CSP/XFO from terminal catch-all (${patched} headers stripped)`);
  console.log("[postbuild-csp] Embed/widget routes now resolve to frame-ancestors *");
} else {
  console.log("[postbuild-csp] Terminal catch-all had no CSP to strip — already clean");
}
