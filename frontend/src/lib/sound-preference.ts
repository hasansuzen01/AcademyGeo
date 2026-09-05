/**
 * Whether the game makes a noise, remembered in the browser it was set in.
 *
 * Every access is guarded: a private window, or a browser told to refuse site
 * data, throws on the first touch of localStorage. Sound is a convenience, so
 * a browser that will not remember the choice gets the default rather than an
 * error.
 */

const KEY = 'academygeo:sound';

export function readSoundPreference(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function writeSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off');
  } catch {
    // The choice holds for this page either way.
  }
}
