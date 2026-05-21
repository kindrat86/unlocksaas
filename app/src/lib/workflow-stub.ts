/**
 * Workflow DevKit stub – temporary build-unblock.
 *
 * Context (2026-05-21): PR #120 migrated FunnelFixer's testimonial-farm +
 * reengagement crons to Vercel Workflow DevKit. The migration imports from
 * `workflow` and `workflow/api`, but those module names belong to an
 * unrelated CLI tool on npm – the actual Workflow DevKit package was never
 * correctly identified. Subsequent hotfix 587756d removed the bogus
 * `workflow` dependency from package.json but did NOT scrub the imports
 * in the 4 consuming files, leaving main with `Module not found: Can't
 * resolve 'workflow/api'` build errors.
 *
 * This module is the smallest possible fix that unblocks the build
 * without reverting PR #120's flow logic. It:
 *
 *   - Exports the names the 4 consumers need (`start`, `resumeHook`,
 *     `sleep`, `createHook`, `FatalError`) with type signatures generic
 *     enough to satisfy TypeScript.
 *   - Each function throws on call with a clear error message so the
 *     4 affected routes 500 honestly instead of silently no-op'ing if
 *     someone POSTs to them before the real Workflow DevKit is wired.
 *
 * Re-enable plan
 * --------------
 * Once the operator identifies the correct npm package for the Vercel
 * Workflow DevKit (current best guess: install via `vercel install workflow`
 * per https://vercel.com/docs/workflow, or the package may live behind
 * `@workflow/next` / `useworkflow` – verify against the docs at the time
 * of the next FunnelFixer activation), update the 4 consuming files to
 * import directly from the real package and delete this stub.
 *
 * Affected files (importers of this stub):
 *   - src/app/api/workflow/funnelfixer/start/route.ts
 *   - src/app/api/workflow/funnelfixer/backfill/route.ts
 *   - src/app/api/workflow/funnelfixer/graduate/route.ts
 *   - src/lib/workflows/funnelfixer-reengagement.ts
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * The stub throws on use – it never silently swallows a workflow
 * dispatch. The FunnelFixer reengagement campaign is operator-gated on
 * an env var anyway (STRIPE_FUNNELFIXER_TESTIMONIAL_PAYMENT_LINK_URL),
 * so the runtime cost of these throws is zero in current production.
 */

const NOT_AVAILABLE =
  "Workflow DevKit is not yet wired into this build. See app/src/lib/workflow-stub.ts for the re-enable plan.";

/**
 * Stub for `workflow/api`.start – the entry point that starts a new
 * durable workflow run. Throws so a misrouted POST to /api/workflow/...
 * surfaces in logs instead of silently no-op'ing.
 */
export function start(..._args: unknown[]): never {
  throw new Error(NOT_AVAILABLE);
}

/**
 * Stub for `workflow/api`.resumeHook – resumes a paused workflow at a
 * named hook. Throws for the same reason as `start`.
 */
export function resumeHook(..._args: unknown[]): never {
  throw new Error(NOT_AVAILABLE);
}

/**
 * Stub for `workflow`.sleep – durable timer primitive. Returns a
 * never-resolving promise so a caller doesn't accidentally race past
 * the stub. In practice nothing calls this in production yet.
 */
export function sleep(..._args: unknown[]): Promise<void> {
  return new Promise(() => {
    /* never resolves – stubbed */
  });
}

/**
 * Stub for `workflow`.createHook – creates a named pause point a
 * workflow can wait on. Throws so misconfigured calls surface.
 */
export function createHook(..._args: unknown[]): never {
  throw new Error(NOT_AVAILABLE);
}

/**
 * Stub for `workflow`.FatalError – marker exception that signals a
 * workflow should abort without retry. We model it as a plain Error
 * subclass so `throw new FatalError(...)` in user code compiles.
 */
export class FatalError extends Error {
  constructor(message?: string) {
    super(message ?? "FatalError (workflow stub)");
    this.name = "FatalError";
  }
}
