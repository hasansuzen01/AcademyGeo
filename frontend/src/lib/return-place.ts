/**
 * Where the back button at the end of a session goes.
 *
 * A session is entered from a collection, from the play hub or from a guide
 * topic, and the link that opens it says which in its `from` parameter. The
 * value arrives in the address bar, so it is matched against the few places it
 * can name rather than used as a path: anything else goes to the play hub.
 */

export interface ReturnPlace {
  href: string;
  label: 'collections' | 'play' | 'guides';
}

const GUIDE_TOPIC = /^guides\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function returnPlace(from: string | undefined): ReturnPlace {
  if (from === 'collections') return { href: '/collections', label: 'collections' };
  if (from && GUIDE_TOPIC.test(from)) return { href: `/${from}`, label: 'guides' };

  return { href: '/play', label: 'play' };
}
