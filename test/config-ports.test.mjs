import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parsePort } from '../src/lib/config.mjs';

describe('parsePort', () => {
  it('returns fallback for empty values', () => {
    assert.equal(parsePort(undefined, 11434), 11434);
    assert.equal(parsePort('', 11435), 11435);
  });

  it('parses valid port numbers', () => {
    assert.equal(parsePort('11434', 1), 11434);
    assert.equal(parsePort(11435, 1), 11435);
  });

  it('rejects invalid ports', () => {
    assert.throws(() => parsePort('0', 11434), /between 1 and 65535/);
    assert.throws(() => parsePort('70000', 11434), /between 1 and 65535/);
    assert.throws(() => parsePort('abc', 11434), /between 1 and 65535/);
  });
});
