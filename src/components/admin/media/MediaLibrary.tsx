import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { getOptimizedImageUrl, formatFileSize } from "../../../lib/media/utils";
const UploadModal = lazy(() => import("./UploadModal"));
const MediaPreviewModal = lazy(() => import("./MediaPreviewModal"));

// ── Types ────────────────────────────────────────────

interface MediaItem {
  id: string;
  key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: string | null;
  createdAt: number;
}

// ── Static Styles ────────────────────────────────────

const containerStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "1.25rem",
  flexWrap: "wrap",
};

const searchWrapStyle: React.CSSProperties = {
  position: "relative",
  flex: "1 1 240px",
  maxWidth: "360px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 2.25rem 0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "0.875rem",
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  outline: "none",
};

const uploadBtnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "var(--color-brand-600)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1rem",
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "10px",
  overflow: "hidden",
  cursor: "pointer",
  transition: "box-shadow 0.15s ease, border-color 0.15s ease",
  position: "relative",
};

const thumbWrapStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  background: "var(--color-surface-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const infoStyle: React.CSSProperties = {
  padding: "0.5rem 0.625rem",
};

const filenameStyle: React.CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--color-text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  margin: "0 0 0.125rem",
};

const sizeStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-text-tertiary)",
  margin: 0,
};

const deleteBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "0.375rem",
  right: "0.375rem",
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "6px",
  border: "none",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  lineHeight: 1,
  opacity: 0,
  transition: "opacity 0.15s ease",
};

const emptyStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "3rem 1rem",
  color: "var(--color-text-tertiary)",
  fontSize: "0.9375rem",
};

const loadingMoreStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "1.5rem",
  color: "var(--color-text-tertiary)",
  fontSize: "0.875rem",
};

// ── Component ────────────────────────────────────────

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch media ──────────────────────────────────

  const fetchMedia = useCallback(async (cursor?: string, keyword?: string, append = false) => {
    const isInitial = !append;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (cursor) params.set("cursor", cursor);
      if (keyword) params.set("search", keyword);

      const res = await fetch(`/api/media?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!json.ok) return;

      const { data, nextCursor: nc, hasMore: hm } = json.data ?? json;

      setItems((prev) => (append ? [...prev, ...data] : data));
      setNextCursor(nc ?? null);
      setHasMore(hm ?? false);
    } catch {
      // ignore
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  // ── Initial load & search ────────────────────────

  useEffect(() => {
    fetchMedia(undefined, search);
  }, [search, fetchMedia]);

  // ── Infinite scroll via IntersectionObserver ─────

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMedia(nextCursor ?? undefined, search, true);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, nextCursor, search, fetchMedia]);

  // ── Search debounce ──────────────────────────────

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value.trim());
    }, 300);
  }

  function clearSearch() {
    setSearchInput("");
    setSearch("");
  }

  // ── Delete ───────────────────────────────────────

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setItems((prev) => prev.filter((m) => m.id !== id));
        // Close preview if the deleted item is being previewed
        if (previewMedia?.id === id) setPreviewMedia(null);
      }
    } catch {
      // ignore
    }
  }

  // ── Upload callback ──────────────────────────────

  function handleUploaded() {
    fetchMedia(undefined, search);
  }

  // ── Dynamic Styles (depend on state) ─────────────

  const clearBtnStyle: React.CSSProperties = {
    position: "absolute",
    right: "0.5rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    fontSize: "1rem",
    lineHeight: 1,
    padding: "0.25rem",
    display: searchInput ? "block" : "none",
  };

  // ── Render ───────────────────────────────────────

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <div style={searchWrapStyle}>
          <input
            type="text"
            placeholder="Search files..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={searchInputStyle}
          />
          <button
            type="button"
            onClick={clearSearch}
            style={clearBtnStyle}
            aria-label="Clear search"
          >
            &times;
          </button>
        </div>
        <button type="button" style={uploadBtnStyle} onClick={() => setUploadOpen(true)}>
          + Upload
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={loadingMoreStyle}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={emptyStyle}>No media files yet. Upload your first file!</div>
      ) : (
        <>
          <div style={gridStyle}>
            {items.map((item) => (
              <div
                key={item.id}
                style={cardStyle}
                onClick={() => setPreviewMedia(item)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-brand-400)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  const btn = e.currentTarget.querySelector("button") as HTMLElement | null;
                  if (btn) btn.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  const btn = e.currentTarget.querySelector("button") as HTMLElement | null;
                  if (btn) btn.style.opacity = "0";
                }}
              >
                <button
                  type="button"
                  style={deleteBtnStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  aria-label="Delete file"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <div style={thumbWrapStyle}>
                  <img
                    src={getOptimizedImageUrl(item.key, { width: 300, quality: 80 })}
                    alt={item.filename}
                    loading="lazy"
                    style={imgStyle}
                  />
                </div>
                <div style={infoStyle}>
                  <p style={filenameStyle} title={item.filename}>
                    {item.filename}
                  </p>
                  <p style={sizeStyle}>{formatFileSize(item.size)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height: 1 }} />

          {/* Loading more indicator */}
          {loadingMore && <div style={loadingMoreStyle}>Loading more...</div>}
        </>
      )}

      {/* Upload Modal */}
      <Suspense fallback={null}>
        <UploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={handleUploaded}
        />
      </Suspense>

      {/* Preview Modal */}
      <Suspense fallback={null}>
        <MediaPreviewModal
          open={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
          media={previewMedia}
          onDelete={handleDelete}
        />
      </Suspense>
    </div>
  );
}

export type { MediaItem };
