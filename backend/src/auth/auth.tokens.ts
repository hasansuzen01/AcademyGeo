/**
 * Injection token for the Better Auth instance. It lives apart from the module
 * so the session guard can import it without a circular dependency.
 */
export const AUTH = Symbol('BETTER_AUTH');
