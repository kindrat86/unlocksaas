# /r/programming draft

> Submit at: https://www.reddit.com/r/programming/submit
>
> Different angle from /r/SaaS – /r/programming is engineers. Lead with
> the technical interesting bit, not the SEO play.
>
> Optimal window: Tuesday or Wednesday, 09:00 to 11:00 US Eastern.
>
> Wait at least 72 hours after the /r/SaaS post to avoid double-dipping detection.

---

## ⚡ PASTE-READY (open this section at submission time, ignore the rest)

**Step 1.** Go to https://www.reddit.com/r/programming/submit and pick **Link post** (the GitHub repo is the link).

**Step 2.** Paste the URL into the link field:

```
https://github.com/kindrat86/unlocksaas/tree/main/packages/seo
```

**Step 3.** Paste the TITLE:

```
A CLI that diffs JSON-LD claims against rendered HTML
```

**Step 4.** Submit. Immediately post the FIRST COMMENT as a reply on your own post:

```markdown
A few engineering decisions that might be interesting:

**1. No HTML parser dependency.** The script blocks have well-bounded syntax
(`<script type="application/ld+json">...</script>`) so regex is fine and
ships zero deps. Visible-text extraction is a conservative tag-strip plus
entity decode, not a full DOM. Tradeoff: this catches the common drift
class but misses cases where JSON-LD is generated client-side. For
server-rendered Next.js / Astro / SvelteKit it works.

**2. Honesty primitives separated from builders.** `auditJsonLd` runs against
ANY JSON-LD object, not just objects built by this library. So you can
audit an existing site without rewriting its schema generation. The CLI
does exactly this.

**3. Zero runtime peer dependencies.** Even the Next.js adapter is React-free.
Instead of shipping a component, it exposes `jsonLdScriptProps(data)` that
returns `{ type, dangerouslySetInnerHTML }` ready to spread onto any
React-shaped framework's <script> tag. Works in Next, Astro, Preact, Solid.

**4. omit-empty is recursive but does NOT mutate.** Returns a new object so
you can pass frozen schemas through it. Empty strings drop, but
deliberately-empty arrays preserve their context inside larger structures.

If anyone has tried similar drift detection at scale and has feedback on
edge cases I haven't hit yet, I'd love to compare notes.
```

**Step 5.** Reply to every top-level comment within 30 minutes for the first 4 hours. /r/programming weights moderator engagement heavily.

---

## Title

```
A CLI that diffs JSON-LD claims against rendered HTML
```

Backup:

```
TypeScript primitives that refuse to emit fabricated schema.org fields
```

---

## Body

```markdown
TL;DR: I built `validate-claims`, a CLI that fetches a URL, parses every
`<script type="application/ld+json">` block, normalizes the visible text,
and reports drift between schema and rendered HTML. MIT, framework-free.
Source in comments.

The interesting technical bit:

Every "easy JSON-LD" library I tried happily emitted invalid shapes that
Google's Rich Results Test accepts but Google's actual AI Overviews
pipeline silently demotes. The three failure modes:

  1. aggregateRating with reviewCount: 0 → entire block downgraded
  2. sameAs entry without https:// → Knowledge Graph dedupes the publisher
  3. datePublished: "soon" → silently dropped by every validator

The pattern is: validators accept the field as syntactically valid, the
ranking pipeline rejects it semantically, and the publisher has no way
to find out which page is demoted.

The CLI approach:

  – Fetch the deployed page (or read a local HTML file)
  – Regex-extract every JSON-LD script block (the schema is well-bounded
    enough that a parser is overkill)
  – json.parse each block, flatten @graph wrappers
  – Run a small set of honesty rules: reviewCount > 0, sameAs is https,
    dates are ISO 8601
  – Diff key fields against the visible HTML: Article.headline must
    appear in <title>; FAQ.mainEntity[].name must appear in body;
    Product.offers[].price must appear in visible text; meta description
    head must appear in body
  – Exit non-zero on any violation so it goes straight into CI

Zero dependencies for the audit logic. The package's only runtime cost
is `node:fetch` (Node 20+) and a few regex passes. The tarball is 57 kB.

The whole thing was extracted from a production SaaS codebase as a
distribution-first play – every npm install is a backlink to the origin
site. Greg Isenberg called this "the great flip" and he's right.

Source: https://github.com/kindrat86/unlocksaas/tree/main/packages/seo
npm: https://www.npmjs.com/package/@unlocksaas/seo
```

---

## First-comment seed

```markdown
A few engineering decisions that might be interesting:

**1. No HTML parser dependency.** The script blocks have well-bounded syntax
(`<script type="application/ld+json">...</script>`) so regex is fine and
ships zero deps. Visible-text extraction is a conservative tag-strip plus
entity decode, not a full DOM. Tradeoff: this catches the common drift
class but misses cases where JSON-LD is generated client-side. For
server-rendered Next.js / Astro / SvelteKit it works.

**2. Honesty primitives separated from builders.** `auditJsonLd` runs against
ANY JSON-LD object, not just objects built by this library. So you can
audit an existing site without rewriting its schema generation. The CLI
does exactly this.

**3. Zero runtime peer dependencies.** Even the Next.js adapter is React-free.
Instead of shipping a component, it exposes `jsonLdScriptProps(data)` that
returns `{ type, dangerouslySetInnerHTML }` ready to spread onto any
React-shaped framework's <script> tag. Works in Next, Astro, Preact, Solid.

**4. omit-empty is recursive but does NOT mutate.** Returns a new object so
you can pass frozen schemas through it. Empty strings drop, but
deliberately-empty arrays preserve their context inside larger structures.

If anyone has tried similar drift detection at scale and has feedback on
edge cases I haven't hit yet, I'd love to compare notes.
```
