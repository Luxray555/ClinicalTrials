/**
 * An array of routes that are accessible to the public.
 * These routes do not require authentication.
 * @type {string[]}
 */
export const publicRoutes = ["/", "/search", "/statistics", "/studies"];

/**
 * An array of routes that are used for authentication.
 * These routes will redirect logged in users to /settings.
 * @type {string[]}
 */
export const authRoutes = ["/auth/login", "/auth/register"];

/**
 * The prefix for API auth routes
 * Routes that starts with this prefix are used for API authentication purposes.
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default login redirect URL
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";

/**
 * The default register redirect URL
 * @type {string}
 */
export const DEFAULT_REGISTER_REDIRECT = "/";
