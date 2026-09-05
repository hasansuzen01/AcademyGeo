import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch } from './api';

function answerWith(body: string, init?: ResponseInit) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(body, init)),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('reads a normal body', async () => {
    answerWith(JSON.stringify({ score: 12 }));

    await expect(apiFetch('/games/active')).resolves.toEqual({ score: 12 });
  });

  // An endpoint with nothing to return answers 200 with no body at all, and
  // reading that as JSON throws "Unexpected end of JSON input".
  it('reads an empty body as null rather than throwing', async () => {
    answerWith('');

    await expect(apiFetch('/games/active')).resolves.toBeNull();
  });

  it('reads a 204 as null', async () => {
    answerWith('', { status: 204 });

    await expect(apiFetch('/games/active')).resolves.toBeNull();
  });

  it('raises the message the API sent when it refuses', async () => {
    answerWith(JSON.stringify({ message: 'Sign in to continue' }), { status: 401 });

    await expect(apiFetch('/games/active')).rejects.toThrow(/sign in/i);
  });

  it('still fails loudly when a refusal has no message', async () => {
    answerWith('', { status: 500 });

    await expect(apiFetch('/games/active')).rejects.toBeInstanceOf(ApiError);
  });
});
