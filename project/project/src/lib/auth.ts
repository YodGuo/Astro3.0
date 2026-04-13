import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { getDBFromEnv } from "./db";
import { getEnv } from "./env";
import { logger } from "./logger";

export function createAuth(env: { DB?: D1Database; BETTER_AUTH_SECRET?: string; BETTER_AUTH_URL?: string }) {
  const db = getDBFromEnv(env);
  const authUrl = env.BETTER_AUTH_URL ?? '';
  const isProduction = authUrl.startsWith('https');

  if (isProduction && !env.BETTER_AUTH_SECRET) {
    throw new Error(
      '[FATAL] BETTER_AUTH_SECRET is not set. In production (HTTPS URL detected), ' +
      'a strong auth secret (min 32 chars) is required. Generate one with: npx auth secret'
    );
  }

  if (authUrl && !authUrl.startsWith('https') && !authUrl.includes('localhost')) {
    logger.error("BETTER_AUTH_SECRET not set", { hint: "Generate one with: npx auth secret" });
  }

  // Derive RP config from site URL for passkey
  const rpId = (() => {
    try {
      const url = new URL(authUrl || 'http://localhost:4321');
      return url.hostname;
    } catch {
      return 'localhost';
    }
  })();

  return betterAuth({
    database: db ? drizzleAdapter(db as any, { provider: "sqlite", usePlural: true }) : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any -- drizzle-orm D1Database type mismatch
    emailAndPassword: { enabled: !!db },
    admin: { enabled: !!db, defaultRole: "user" },
    user: {
      additionalFields: {
        role: { type: ["user", "admin"], required: false, defaultValue: "user", input: false },
      },
    },
    secret: env.BETTER_AUTH_SECRET || (isProduction ? undefined : 'dev-secret-not-for-production'),
    trustedOrigins: env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : ["http://localhost:4321"],
    advanced: {
      useSecureCookies: env.BETTER_AUTH_URL?.startsWith("https") ?? false,
      cookies: {
        session_token: {
          attributes: {
            sameSite: "strict",
          },
        },
        session_data: {
          attributes: {
            sameSite: "strict",
          },
        },
      },
    },
    plugins: [
      passkey({
        rpID: rpId,
        rpName: (env.BETTER_AUTH_URL ? new URL(env.BETTER_AUTH_URL).hostname : 'Site') as string,
        origin: env.BETTER_AUTH_URL || 'http://localhost:4321',
        authenticatorSelection: {
          authenticatorAttachment: "cross-platform",
          userVerification: "required",
        },
      }),
    ],
  });
}

export async function getAuth() {
  try {
    const env = await getEnv();
    return createAuth(env);
  } catch {
    return createAuth({});
  }
}

export type Auth = ReturnType<typeof createAuth>;
