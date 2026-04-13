/// <reference path="../.astro/types.d.ts" />

declare module '*.css?raw' {
  const content: string;
  export default content;
}

/**
 * Extended user type with custom fields defined in auth.ts.
 * Better Auth's base User type does not include `role` (added via additionalFields).
 * This interface provides type-safe access to custom fields without `as Record<string, unknown>`.
 */
interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: "user" | "admin";
}

declare namespace App {
  interface Locals {
    user: AdminUser | null;
    session: import("better-auth").Session | null;
  }
}
