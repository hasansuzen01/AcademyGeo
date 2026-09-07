/**
 * Liveness for the web container.
 *
 * Deliberately says nothing about the API: a platform restarting the site
 * because the backend blinked would take the whole thing down together.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok', uptime: process.uptime() });
}
