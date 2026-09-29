import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetch, gradeGuess } from './api';

// 204 is only legal with a null body, which is exactly what it means.
function answerWith(body: string | null, init?: ResponseInit) {
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
    answerWith(null, { status: 204 });

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

describe('gradeGuess', () => {
  const guess = { metaId: 'meta-1', guessedCountryCode: 'NO', responseMs: 2300 };

  function lastRequest() {
    const call = vi.mocked(fetch).mock.calls.at(-1)!;
    return { url: String(call[0]), body: JSON.parse(String(call[1]?.body)) };
  }

  // A player's answer is remembered: it reschedules the card and feeds the
  // dashboard, so it goes to the route that needs an account.
  it('records the answer of someone signed in', async () => {
    answerWith(JSON.stringify({ correct: true }));

    await gradeGuess(guess, true);

    expect(lastRequest().url).toMatch(/\/api\/review\/answer$/);
    expect(lastRequest().body).toEqual(guess);
  });

  // A visitor only wants the verdict. The API refuses fields it does not
  // expect, so the response time stays behind.
  it('only checks the answer of a visitor, without the response time', async () => {
    answerWith(JSON.stringify({ correct: false }));

    await gradeGuess(guess, false);

    expect(lastRequest().url).toMatch(/\/api\/review\/check$/);
    expect(lastRequest().body).toEqual({ metaId: 'meta-1', guessedCountryCode: 'NO' });
  });
});
