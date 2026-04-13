import { useState, useEffect } from "react";

interface ProductFormProps {
  mode?: "create" | "edit";
  productId?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductForm({ mode = "create", productId }: ProductFormProps) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Load all categories
  useEffect(() => {
    fetch("/api/product-categories")
      .then((res) => res.json() as Promise<Record<string, unknown>>)
      .then((data) => {
        if (data.data) setCategories(data.data as Category[]);
      })
      .catch(() => {});
  }, []);

  // In edit mode, load product in parallel with categories (async-parallel)
  useEffect(() => {
    if (mode === "edit" && productId) {
      Promise.all([
        fetch("/api/product-categories").then((res) => res.json() as Promise<Record<string, unknown>>),
        fetch(`/api/products/${productId}`).then((res) => res.json() as Promise<Record<string, unknown>>),
      ]).then(([catData, productData]) => {
        if (catData.data) setCategories(catData.data as Category[]);
        if (productData.error) { setError(productData.error as string); return; }
        setName((productData.name as string) || "");
        setSummary((productData.summary as string) || "");
        setDescription((productData.description as string) || "");
        setPublished(productData.published === 1 || productData.published === true);
        setSelectedCategoryId((productData.categoryId as string) || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    }
  }, [mode, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      const url = mode === "edit" && productId ? `/api/products/${productId}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, summary, description, published, categoryId: selectedCategoryId || null }) });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) { setError(data.error as string || "Failed to save"); return; }
      setSuccess(mode === "edit" ? "Product updated!" : `Product "${data.slug as string}" created!`);
      if (mode === "create") { setName(""); setSummary(""); setDescription(""); setPublished(false); setSelectedCategoryId(""); }
    } catch (err) { setError(err instanceof Error ? err.message : "Network error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <p style={{ color: "var(--color-text-tertiary)" }}>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {success ? <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "0.875rem" }}>{success}</div> : null}
      {error ? <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>{error}</div> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Product Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., UPS-3000RT" required style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem" }} />
      </div>
      {categories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
          >
            <option value="">— No Category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="Brief description" style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Full Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Detailed description" style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ borderRadius: "4px" }} />
        <label htmlFor="published" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Published</label>
      </div>
      <button type="submit" disabled={submitting} style={{ padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, background: "var(--color-brand-600)", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, alignSelf: "flex-start" }}>
        {submitting ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
      </button>
    </form>
  );
}
