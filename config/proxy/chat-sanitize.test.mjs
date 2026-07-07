import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeToolCallArguments,
  sanitizeChatMessage,
  sanitizeChatRequest,
  sanitizeChatResponseBody,
} from './chat-sanitize.mjs';

describe('chat sanitize', () => {
  it('keeps valid JSON tool arguments unchanged', () => {
    const args = '{"command":"npm test"}';
    assert.equal(normalizeToolCallArguments(args), args);
  });

  it('repairs truncated JSON tool arguments', () => {
    const repaired = normalizeToolCallArguments('{"command":"npm test"');
    assert.doesNotThrow(() => JSON.parse(repaired));
  });

  it('stringifies object tool arguments', () => {
    assert.equal(normalizeToolCallArguments({ path: 'README.md' }), '{"path":"README.md"}');
  });

  it('sanitizes invalid tool calls in request history', () => {
    const sanitized = sanitizeChatRequest({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'user', content: 'commit and tag' },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: {
                name: 'Shell',
                arguments: '{"command":"git status"',
              },
            },
          ],
        },
      ],
    });

    const args = sanitized.messages[1].tool_calls[0].function.arguments;
    assert.doesNotThrow(() => JSON.parse(args));
  });

  it('flattens multipart message content from native Cursor history', () => {
    const sanitized = sanitizeChatMessage({
      role: 'user',
      content: [{ type: 'text', text: 'hello' }],
    });

    assert.equal(sanitized.content, 'hello');
  });

  it('sanitizes malformed tool calls in non-streaming responses', () => {
    const body = sanitizeChatResponseBody(
      JSON.stringify({
        choices: [
          {
            message: {
              role: 'assistant',
              tool_calls: [
                {
                  id: 'call_2',
                  type: 'function',
                  function: {
                    name: 'Read',
                    arguments: '{"path":"README.md"',
                  },
                },
              ],
            },
          },
        ],
      }),
    );

    const parsed = JSON.parse(body);
    const args = parsed.choices[0].message.tool_calls[0].function.arguments;
    assert.doesNotThrow(() => JSON.parse(args));
  });
});
