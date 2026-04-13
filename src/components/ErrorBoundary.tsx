import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] React component crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: "2rem",
          margin: "1rem auto",
          maxWidth: "600px",
          textAlign: "center",
          background: "var(--color-surface, #fff)",
          border: "1px solid var(--color-border, #e5e7eb)",
          borderRadius: "var(--radius-lg, 8px)",
        }}>
          <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "var(--color-text, #1a1a1a)" }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--color-text-secondary, #6b7280)", marginBottom: "1rem" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md, 6px)",
              border: "1px solid var(--color-border, #e5e7eb)",
              background: "var(--color-surface, #fff)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
