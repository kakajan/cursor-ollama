function tryRepairJsonString(value) {
  let candidate = value.trim();
  if (!candidate) return '{}';

  const openCurly = (candidate.match(/\{/g) || []).length;
  const closeCurly = (candidate.match(/\}/g) || []).length;
  const openSquare = (candidate.match(/\[/g) || []).length;
  const closeSquare = (candidate.match(/\]/g) || []).length;

  if (openCurly > closeCurly) {
    candidate += '}'.repeat(openCurly - closeCurly);
  }
  if (openSquare > closeSquare) {
    candidate += ']'.repeat(openSquare - closeSquare);
  }

  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    return null;
  }
}

export function normalizeToolCallArguments(value) {
  if (value == null || value === '') {
    return '{}';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value !== 'string') {
    return '{}';
  }

  try {
    JSON.parse(value);
    return value;
  } catch {
    return tryRepairJsonString(value) || '{}';
  }
}

function flattenMessageContent(content) {
  if (typeof content === 'string' || content == null) {
    return content ?? '';
  }

  if (!Array.isArray(content)) {
    return String(content);
  }

  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part?.type === 'text' && part.text) return part.text;
      if (part?.type === 'input_text' && part.text) return part.text;
      if (part?.type === 'output_text' && part.text) return part.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export function sanitizeToolCall(toolCall) {
  if (!toolCall || typeof toolCall !== 'object') {
    return toolCall;
  }

  return {
    id: toolCall.id || `call_${Math.random().toString(36).slice(2, 10)}`,
    type: toolCall.type || 'function',
    function: {
      name: toolCall.function?.name || 'unknown',
      arguments: normalizeToolCallArguments(toolCall.function?.arguments),
    },
  };
}

export function sanitizeChatMessage(message) {
  if (!message || typeof message !== 'object') {
    return message;
  }

  const out = { ...message };

  if (Array.isArray(out.content)) {
    out.content = flattenMessageContent(out.content);
  }

  if (out.role === 'tool' && typeof out.content !== 'string') {
    out.content =
      typeof out.content === 'object' ? JSON.stringify(out.content) : String(out.content ?? '');
  }

  if (Array.isArray(out.tool_calls)) {
    out.tool_calls = out.tool_calls.map(sanitizeToolCall);
  }

  delete out.reasoning;
  delete out.reasoning_content;

  return out;
}

export function sanitizeChatMessages(messages) {
  if (!Array.isArray(messages)) {
    return messages;
  }

  return messages.map(sanitizeChatMessage);
}

export function sanitizeChatRequest(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const out = { ...body };
  if (Array.isArray(out.messages)) {
    out.messages = sanitizeChatMessages(out.messages);
  }
  return out;
}

export function sanitizeChatResponseBody(bodyText) {
  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return bodyText;
  }

  if (!parsed || typeof parsed !== 'object') {
    return bodyText;
  }

  for (const choice of parsed.choices || []) {
    if (choice?.message?.tool_calls) {
      choice.message.tool_calls = choice.message.tool_calls.map(sanitizeToolCall);
    }
  }

  return JSON.stringify(parsed);
}
