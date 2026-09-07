/** Localhost is one site whatever port it answers on, and it is not HTTPS. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function hostOf(url: string): string | null {
  try {
    return new URL(url.split(',')[0].trim()).hostname;
  } catch {
    return null;
  }
}

/**
 * Whether the session cookie has to be sent across sites.
 *
 * In production the web app and the API get a domain each, so the cookie the
 * browser holds for the API is only sent back on a request from the web app
 * if it says so. This used to be keyed on whether a shared cookie domain had
 * been configured, which meant one unset variable signed everybody out on
 * their next click with no error anywhere.
 */
export function needsCrossSiteCookie({
  webUrl,
  apiUrl,
}: {
  webUrl: string;
  apiUrl: string;
}): boolean {
  const web = hostOf(webUrl);
  const api = hostOf(apiUrl);
  if (!web || !api) return false;
  if (LOCAL_HOSTS.has(web) && LOCAL_HOSTS.has(api)) return false;

  return web !== api;
}
