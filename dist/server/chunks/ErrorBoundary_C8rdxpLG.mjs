globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
import { r as reactExports } from "./worker-entry_BCrPo2Ie.mjs";
class ErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] React component crashed:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        padding: "2rem",
        margin: "1rem auto",
        maxWidth: "600px",
        textAlign: "center",
        background: "var(--color-surface, #fff)",
        border: "1px solid var(--color-border, #e5e7eb)",
        borderRadius: "var(--radius-lg, 8px)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { marginTop: 0, fontSize: "1.25rem", color: "var(--color-text, #1a1a1a)" }, children: "Something went wrong" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-secondary, #6b7280)", marginBottom: "1rem" }, children: "An unexpected error occurred. Please try refreshing the page." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => this.setState({ hasError: false, error: null }),
            style: {
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md, 6px)",
              border: "1px solid var(--color-border, #e5e7eb)",
              background: "var(--color-surface, #fff)",
              cursor: "pointer",
              fontSize: "0.875rem"
            },
            children: "Try Again"
          }
        )
      ] });
    }
    return this.props.children;
  }
}
export {
  ErrorBoundary as E
};
