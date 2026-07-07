import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTunnelYml, tokenToCredentialsJson } from '../src/lib/tunnel.mjs';

test('parseTunnelYml reads tunnel id and credentials path', () => {
  const parsed = parseTunnelYml(`tunnel: abc-123
credentials-file: C:/Users/test/.cloudflared/abc-123.json

ingress:
  - service: http_status:404
`);

  assert.equal(parsed.tunnelId, 'abc-123');
  assert.equal(parsed.credentialsFile, 'C:/Users/test/.cloudflared/abc-123.json');
});

test('tokenToCredentialsJson converts cloudflared token payload', () => {
  const token = Buffer.from(
    JSON.stringify({
      a: 'account-tag',
      s: 'tunnel-secret',
      t: 'tunnel-id',
    }),
  ).toString('base64');

  const json = JSON.parse(tokenToCredentialsJson(token));
  assert.deepEqual(json, {
    AccountTag: 'account-tag',
    TunnelSecret: 'tunnel-secret',
    TunnelID: 'tunnel-id',
  });
});
