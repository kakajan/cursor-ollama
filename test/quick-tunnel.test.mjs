import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getPublicBaseUrl,
  getPublicTunnelUrl,
  isQuickTunnelMode,
  normalizeQuickHostname,
  parseQuickTunnelFromLogs,
} from '../src/lib/quick-tunnel.mjs';

describe('quick tunnel helpers', () => {
  it('detects quick tunnel mode', () => {
    assert.equal(isQuickTunnelMode({ tunnelMode: 'quick' }), true);
    assert.equal(isQuickTunnelMode({ tunnelMode: 'named' }), false);
  });

  it('parses trycloudflare hostname from logs', () => {
    const logs =
      'INF Thank you for trying Cloudflare Tunnel. https://basis-continually-variables-trips.trycloudflare.com';
    assert.equal(
      parseQuickTunnelFromLogs(logs),
      'basis-continually-variables-trips.trycloudflare.com',
    );
  });

  it('builds public URLs from config hostname', () => {
    const config = { tunnelHostname: 'abc.trycloudflare.com' };
    assert.equal(getPublicTunnelUrl(config), 'https://abc.trycloudflare.com');
    assert.equal(getPublicBaseUrl(config), 'https://abc.trycloudflare.com/v1');
  });

  it('normalizes hostname values', () => {
    assert.equal(
      normalizeQuickHostname('https://Foo.trycloudflare.com/path'),
      'foo.trycloudflare.com',
    );
  });
});
