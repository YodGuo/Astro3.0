class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Require admin authentication for API routes.
 * Throws AuthError if not authenticated (401) or not admin (403).
 * Returns the authenticated user object on success.
 *
 * Usage in API handlers:
 * ```ts
 * export const POST: APIRoute = async ({ request, locals }) => {
 *   const user = requireAdmin(locals);
 *   // ... handler code
 * };
 * ```
 *
 * The middleware will catch the thrown error and return the appropriate response.
 * Alternatively, wrap your handler in a try/catch:
 * ```ts
 * try {
 *   const user = requireAdmin(locals);
 * } catch (e) {
 *   if (e instanceof AuthError) return new Response(JSON.stringify({ error: e.message }), { status: e.status, headers: { "Content-Type": "application/json" } });
 *   throw e;
 * }
 * ```
 */
export function requireAdmin(locals: App.Locals): Record<string, unknown> {
  const user = locals.user as { role?: string } | null;

  if (!user) {
    throw new AuthError("Unauthorized: authentication required", 401);
  }

  if (user.role !== "admin") {
    throw new AuthError("Forbidden: admin access required", 403);
  }

  return user as Record<string, unknown>;
}

export { AuthError };
