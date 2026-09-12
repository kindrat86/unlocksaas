// Offline regression of the ACTUAL source functions, not mirrored redirects.
// Mail transport, cookies and analytics are stubbed. No network or real buyer.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

const appRoot = fileURLToPath(new URL('../../', import.meta.url));
const sourceRoot = process.env.UNLOCKSAAS_SOURCE_ROOT || appRoot;
const require = createRequire(new URL('../../package.json', import.meta.url));
const ts = require('typescript');
const origin = 'https://unlocksaas.example.invalid';

function loadSource(relative, name, dependencies = {}, root = sourceRoot) {
  const filename = join(root, relative);
  const source = readFileSync(filename, 'utf8');
  let selected = source;
  if (name) {
    const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const node = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === name);
    assert.ok(node, `source function ${name} exists in ${filename}`);
    selected = node.getText(ast);
  }
  const compiled = ts.transpileModule(selected, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
    reportDiagnostics: true,
  });
  assert.equal((compiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  const context = {
    exports: {}, URL, URLSearchParams, FormData,
    process: { env: { NEXT_PUBLIC_APP_URL: origin } },
    console: { error() {}, warn() {}, log() {} },
    ...dependencies,
  };
  runInNewContext(compiled.outputText + (name ? `\nexports.subject = ${name};` : ''), context, { timeout: 1000 });
  return name ? context.exports.subject : context.exports;
}

for (const [label, query] of Object.entries({
  session: { session_id: 'cs_test_OfflineFixture' },
  attribution: { session_id: 'cs_test_OfflineFixture', utm_source: 'partner', utm_campaign: 'a&b=c', ref: 'x/y+z' },
  arrays: { session_id: ['cs_test_First', 'cs_test_Second'], utm_medium: 'email', ignored: 'not-forwarded' },
})) {
  test(`actual onboarding, login action and callback preserve checkout context: ${label}`, async () => {
    const helpers = loadSource('src/lib/onboarding-return-path.ts', null, {}, appRoot);
    const sentinel = Symbol('redirect');
    let location;
    const onboarding = loadSource('src/app/(app)/onboarding/page.tsx', 'OnboardingBody', {
      ...helpers,
      connection: async () => {},
      createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null }, error: null }) } }),
      redirect: url => { location = url; throw sentinel; },
    });
    await assert.rejects(
      onboarding({ searchParams: Promise.resolve(query) }),
      error => error === sentinel,
    );
    const next = new URL(location, origin).searchParams.get('next');
    assert.equal(next, helpers.buildOnboardingDestination(query), 'actual anonymous page must retain the checkout destination');

    let otpOptions;
    let otpCalls = 0;
    const login = loadSource('src/app/(marketing)/login/actions.ts', 'sendMagicLink', {
      headers: async () => new Headers({ host: 'unlocksaas.example.invalid', 'x-forwarded-proto': 'https' }),
      createClient: async () => ({ auth: { signInWithOtp: async options => { otpCalls++; otpOptions = options; return { error: null }; } } }),
      captureServer: () => {}, Event: { MagicLinkRequested: 'offline-magic-link-requested' },
    });
    const form = new FormData();
    form.set('email', 'buyer@example.invalid');
    form.set('next', next);
    const result = await login({ ok: false, message: '' }, form);
    assert.equal(result.ok, true);
    assert.equal(otpCalls, 1, 'one synthetic transport invocation, not a real email');
    assert.equal(otpOptions.options.shouldCreateUser, true);

    const callbackUrl = new URL(otpOptions.options.emailRedirectTo);
    assert.equal(callbackUrl.searchParams.get('next'), next);
    callbackUrl.searchParams.set('code', 'offline-fixture-code');
    let exchanges = 0;
    const callback = loadSource('src/app/auth/callback/route.ts', 'GET', {
      NextResponse: { redirect: url => url },
      createClient: async () => ({ auth: { exchangeCodeForSession: async code => {
        assert.equal(code, 'offline-fixture-code'); exchanges++;
        return { data: { session: { user: { id: 'offline-user' } } }, error: null };
      } } }),
      captureServerAndFlush: async () => {}, Event: { UserSignedIn: 'offline-user-signed-in' },
    });
    const destination = await callback({ url: callbackUrl.toString() });
    assert.equal(exchanges, 1);
    assert.equal(destination, origin + helpers.buildOnboardingDestination(query));
    const returned = new URL(destination);
    assert.equal(returned.searchParams.get('session_id'), Array.isArray(query.session_id) ? query.session_id[0] : query.session_id);
    assert.equal(returned.searchParams.has('ignored'), false);
  });
}
