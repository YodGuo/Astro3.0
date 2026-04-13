globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
import { r as reactExports } from "./worker-entry_BCrPo2Ie.mjs";
function ProductForm({ mode = "create", productId }) {
  const [name, setName] = reactExports.useState("");
  const [summary, setSummary] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [published, setPublished] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(mode === "edit");
  const [success, setSuccess] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [categories, setCategories] = reactExports.useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = reactExports.useState("");
  reactExports.useEffect(() => {
    fetch("/api/product-categories").then((res) => res.json()).then((data) => {
      if (data.data) setCategories(data.data);
    }).catch(() => {
    });
  }, []);
  reactExports.useEffect(() => {
    if (mode === "edit" && productId) {
      Promise.all([
        fetch("/api/product-categories").then((res) => res.json()),
        fetch(`/api/products/${productId}`).then((res) => res.json())
      ]).then(([catData, productData]) => {
        if (catData.data) setCategories(catData.data);
        if (productData.error) {
          setError(productData.error);
          return;
        }
        setName(productData.name || "");
        setSummary(productData.summary || "");
        setDescription(productData.description || "");
        setPublished(productData.published === 1 || productData.published === true);
        setSelectedCategoryId(productData.categoryId || "");
      }).catch((err) => setError(err.message)).finally(() => setLoading(false));
    }
  }, [mode, productId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const url = mode === "edit" && productId ? `/api/products/${productId}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, summary, description, published, categoryId: selectedCategoryId || null }) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      setSuccess(mode === "edit" ? "Product updated!" : `Product "${data.slug}" created!`);
      if (mode === "create") {
        setName("");
        setSummary("");
        setDescription("");
        setPublished(false);
        setSelectedCategoryId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--color-text-tertiary)" }, children: "Loading..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
    success ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "0.875rem" }, children: success }) : null,
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }, children: error }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Product Name *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g., UPS-3000RT", required: true, style: { padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem" } })
    ] }),
    categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Category" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: selectedCategoryId,
          onChange: (e) => setSelectedCategoryId(e.target.value),
          style: { padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", color: "var(--color-text-primary)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— No Category —" }),
            categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat.id, children: cat.name }, cat.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: summary, onChange: (e) => setSummary(e.target.value), rows: 2, placeholder: "Brief description", style: { padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", resize: "vertical" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Full Description" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 6, placeholder: "Detailed description", style: { padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", resize: "vertical" } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "published", checked: published, onChange: (e) => setPublished(e.target.checked), style: { borderRadius: "4px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "published", style: { fontSize: "0.875rem", fontWeight: 500 }, children: "Published" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, style: { padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, background: "var(--color-brand-600)", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, alignSelf: "flex-start" }, children: submitting ? "Saving..." : mode === "create" ? "Create Product" : "Update Product" })
  ] });
}
export {
  ProductForm as P
};
