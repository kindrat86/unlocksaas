import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Exercise the actual cancel_url expression from the Playbook checkout branch.
const source = readFileSync(new URL('../../src/app/api/checkout/route.ts', import.meta.url), 'utf8');
const branch = source.slice(source.indexOf('if (priceType === "playbook") {'));
const expression = branch.match(/cancel_url:\s*([\s\S]*?),\n\s*metadata:/)[1];
// Trusted repository source only, never customer input or a remote expression.
const cancelUrl = new Function('appUrl', 'diagnosticFrom', `return (${expression});`);
test('founding checkout cancellation returns to the founding offer', () => {
  assert.equal(cancelUrl('https://unlocksaas.com', 'founding'), 'https://unlocksaas.com/founding');
});
test('existing non-founding upgrade cancellation keeps its upsell path', () => {
  assert.equal(cancelUrl('https://unlocksaas.com', undefined), 'https://unlocksaas.com/oto/vault');
  assert.equal(cancelUrl('https://unlocksaas.com', 'diagnostic'), 'https://unlocksaas.com/oto/vault');
});
