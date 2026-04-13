import { lazy, Suspense } from "react";

const NewsForm = lazy(() => import("./NewsForm"));

interface LazyNewsFormProps {
  mode?: "create" | "edit";
  articleId?: string;
}

function Fallback() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "300px", gap: "1rem", color: "var(--color-text-tertiary, #9ca3af)", fontSize: "0.875rem",
    }}>
      <div style={{
        width: "2rem", height: "2rem", border: "2px solid var(--color-border, #e5e7eb)",
        borderTopColor: "var(--color-brand-600, #2563eb)", borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }} />
      <span>Loading editor...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LazyNewsForm(props: LazyNewsFormProps) {
  return (
    <Suspense fallback={<Fallback />}>
      <NewsForm {...props} />
    </Suspense>
  );
}
