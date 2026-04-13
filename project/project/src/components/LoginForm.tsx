import { useState } from "react";
import { signIn, authClient } from "../lib/auth-client";

// ── Static Styles ────────────────────────────────────

const btnBase: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  transition: "opacity 0.15s",
};

// ── Component ────────────────────────────────────────

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Login failed");
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true);
    setError(null);

    try {
      if (!window.PublicKeyCredential) {
        setError("Passkeys are not supported in this browser.");
        setPasskeyLoading(false);
        return;
      }

      const result = await authClient.signIn.passkey();
      if (result.error) {
        setError(result.error.message || "Passkey sign-in failed");
      } else {
        window.location.href = "/admin";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Passkey sign-in failed");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "24rem", margin: "0 auto" }}>
      <div style={{
        background: "var(--color-surface)", border: "1px solid var(--color-border)",
        borderRadius: "12px", padding: "2rem",
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Sign In</h1>

        {error ? (
          <div style={{
            padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem", marginBottom: "1rem",
          }}>
            {error}
          </div>
        ) : null}

        {/* Passkey sign-in button */}
        <button
          type="button"
          onClick={handlePasskeySignIn}
          disabled={passkeyLoading || loading}
          style={{
            ...btnBase,
            width: "100%",
            background: "#1e293b",
            color: "#fff",
            opacity: passkeyLoading ? 0.7 : 1,
            marginBottom: "0.75rem",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
          {passkeyLoading ? "Waiting for device..." : "Sign in with Passkey"}
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          margin: "1rem 0", color: "var(--color-text-tertiary)", fontSize: "0.75rem",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          or continue with password
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourcompany.com"
              required
              style={{
                padding: "0.5rem 0.75rem", borderRadius: "6px",
                border: "1px solid var(--color-border)", fontSize: "0.875rem",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: "0.5rem 0.75rem", borderRadius: "6px",
                border: "1px solid var(--color-border)", fontSize: "0.875rem",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || passkeyLoading}
            style={{
              ...btnBase,
              background: "var(--color-brand-600)", color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In with Password"}
          </button>
        </form>

        <p style={{
          marginTop: "1.5rem", fontSize: "0.75rem",
          color: "var(--color-text-tertiary)", textAlign: "center",
        }}>
          Contact your administrator to create an account.
        </p>
      </div>
    </div>
  );
}
