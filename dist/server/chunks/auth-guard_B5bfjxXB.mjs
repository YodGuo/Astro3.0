globalThis.process ??= {};
globalThis.process.env ??= {};
class AuthError extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
function requireAdmin(locals) {
  const user = locals.user;
  if (!user) {
    throw new AuthError("Unauthorized: authentication required", 401);
  }
  if (user.role !== "admin") {
    throw new AuthError("Forbidden: admin access required", 403);
  }
  return user;
}
export {
  AuthError as A,
  requireAdmin as r
};
