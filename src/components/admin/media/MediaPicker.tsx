import React, { useState, useEffect, useRef, useCallback } from "react";
import { getOptimizedImageUrl, formatFileSize } from "../../../lib/media/utils";

interface MediaItem {
  id: string;
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPicker({ open, onClose, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const fetchItems = useCallback(async (c: string | null, s: string, append: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (c) params.set("cursor", c);
      params.set("limit", "20");
      if (s) params.set("search", s);

      const res = await fetch(`/api/media?${params}`);
      const json = await res.json();
      if (json.ok && json.data) {
        const filtered = (json.data as MediaItem[]).filter((m) => m.mimeType.startsWith("image/"));
        setItems((prev) => append ? [...prev, ...filtered] : filtered);
        setCursor(json.nextCursor ?? null);
        setHasMore(json.hasMore ?? false);
      }
    } catch { /* ignore */ }
    finally { loadingRef.current = false; setLoading(false); setInitialLoading(false); }
  }, []);

  // Initial load
  useEffect(() => {
    if (open) {
      setItems([]);
      setCursor(null);
      setHasMore(true);
      setInitialLoading(true);
      fetchItems(null, "", false);
    }
  }, [open, fetchItems]);

  // Search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setItems([]);
      setCursor(null);
      setHasMore(true);
      fetchItems(null, value, false);
    }, 300);
  };

  // Infinite scroll
  useEffect(() => {
    if (!open || !hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && cursor) fetchItems(cursor, search, true); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasMore, loading, cursor, search, fetchItems]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)", borderRadius: "12px",
          border: "1px solid var(--color-border)",
          width: "90vw", maxWidth: "720px", maxHeight: "80vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Insert Image</h3>
          <div style={{ flex: 1 }} />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              padding: "0.375rem 0.75rem", borderRadius: "6px",
              border: "1px solid var(--color-border)", fontSize: "0.8125rem",
              width: "200px", outline: "none",
            }}
          />
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--color-text-tertiary)", padding: "0.25rem", lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {initialLoading ? (
            <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: "2rem" }}>Loading...</p>
          ) : items.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: "2rem" }}>No images found.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  title={`${item.filename} — ${formatFileSize(item.size)}`}
                  style={{
                    background: "none", border: "2px solid transparent", borderRadius: "8px",
                    cursor: "pointer", padding: "0", overflow: "hidden",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-600, #2563eb)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                >
                  <img
                    src={getOptimizedImageUrl(item.key, { width: 300, quality: 80 })}
                    alt={item.filename}
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    padding: "0.375rem 0.5rem", fontSize: "0.6875rem",
                    color: "var(--color-text-secondary)", textAlign: "center",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    background: "var(--color-surface)",
                  }}>
                    {item.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div ref={sentinelRef} style={{ height: "1px" }} />
          {loading && !initialLoading && (
            <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", padding: "1rem", fontSize: "0.8125rem" }}>Loading more...</p>
          )}
        </div>
      </div>
    </div>
  );
}
