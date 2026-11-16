import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { showcasePathForQuery } from "../../src/lib/nlweb/showcase-queries.ts";

const proxySource = readFileSync(join(process.cwd(), "src/proxy.ts"), "utf8");

describe("GSC showcase canonical URLs", () => {
  it("maps curated query aliases to stable slug paths only", () => {
    assert.equal(
      showcasePathForQuery(" why is my stripe line flat after launch "),
      "/ask/why-is-my-stripe-line-flat",
    );
    assert.equal(
      showcasePathForQuery("WHY IS MY STRIPE LINE FLAT AFTER LAUNCH"),
      "/ask/why-is-my-stripe-line-flat",
    );
    assert.equal(showcasePathForQuery("an arbitrary founder question"), null);
  });
});
