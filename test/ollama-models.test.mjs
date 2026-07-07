import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { modelNameMatches } from '../src/lib/ollama.mjs';

describe('ollama model matching', () => {
  const available = ['qwen2.5-coder:7b', 'llama3.2:3b', 'mistral:latest'];

  it('matches exact model names', () => {
    assert.equal(modelNameMatches(available, 'qwen2.5-coder:7b'), true);
    assert.equal(modelNameMatches(available, 'missing:7b'), false);
  });

  it('matches base names without tags', () => {
    assert.equal(modelNameMatches(available, 'qwen2.5-coder'), true);
    assert.equal(modelNameMatches(available, 'llama3.2'), true);
  });

  it('matches alternate tags for the same base model', () => {
    assert.equal(modelNameMatches(available, 'mistral:7b'), true);
  });
});
