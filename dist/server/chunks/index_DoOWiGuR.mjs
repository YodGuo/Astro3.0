globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate } from "./sequence_IbtNAemG.mjs";
import { r as reactExports, a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
import { E as ErrorBoundary } from "./ErrorBoundary_C8rdxpLG.mjs";
function getOptimizedImageUrl(key, options) {
  const params = new URLSearchParams();
  if (options?.width) params.set("w", String(options.width));
  if (options?.format) params.set("f", options.format);
  if (options?.quality) params.set("q", String(options.quality));
  if (!params.has("q")) params.set("q", "80");
  const qs = params.toString();
  return `/media/${key}${qs ? `?${qs}` : ""}`;
}
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
const UploadModal = reactExports.lazy(() => import("./UploadModal_UTBui1PX.mjs"));
const MediaPreviewModal = reactExports.lazy(() => import("./MediaPreviewModal_DvjaKyBe.mjs"));
const containerStyle = {
  fontFamily: "var(--font-sans)"
};
const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "1.25rem",
  flexWrap: "wrap"
};
const searchWrapStyle = {
  position: "relative",
  flex: "1 1 240px",
  maxWidth: "360px"
};
const searchInputStyle = {
  width: "100%",
  padding: "0.5rem 2.25rem 0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
  fontSize: "0.875rem",
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  outline: "none"
};
const uploadBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontWeight: 500,
  background: "var(--color-brand-600)",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1rem"
};
const cardStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "10px",
  overflow: "hidden",
  cursor: "pointer",
  transition: "box-shadow 0.15s ease, border-color 0.15s ease",
  position: "relative"
};
const thumbWrapStyle = {
  width: "100%",
  aspectRatio: "1",
  background: "var(--color-surface-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden"
};
const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};
const infoStyle = {
  padding: "0.5rem 0.625rem"
};
const filenameStyle = {
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--color-text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  margin: "0 0 0.125rem"
};
const sizeStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-tertiary)",
  margin: 0
};
const deleteBtnStyle = {
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
  transition: "opacity 0.15s ease"
};
const emptyStyle = {
  textAlign: "center",
  padding: "3rem 1rem",
  color: "var(--color-text-tertiary)",
  fontSize: "0.9375rem"
};
const loadingMoreStyle = {
  textAlign: "center",
  padding: "1.5rem",
  color: "var(--color-text-tertiary)",
  fontSize: "0.875rem"
};
function MediaLibrary() {
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [loadingMore, setLoadingMore] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [searchInput, setSearchInput] = reactExports.useState("");
  const [nextCursor, setNextCursor] = reactExports.useState(null);
  const [hasMore, setHasMore] = reactExports.useState(false);
  const [uploadOpen, setUploadOpen] = reactExports.useState(false);
  const [previewMedia, setPreviewMedia] = reactExports.useState(null);
  const debounceRef = reactExports.useRef(null);
  const sentinelRef = reactExports.useRef(null);
  const fetchMedia = reactExports.useCallback(async (cursor, keyword, append = false) => {
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
      setItems((prev) => append ? [...prev, ...data] : data);
      setNextCursor(nc ?? null);
      setHasMore(hm ?? false);
    } catch {
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchMedia(void 0, search);
  }, [search, fetchMedia]);
  reactExports.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMedia(nextCursor ?? void 0, search, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, nextCursor, search, fetchMedia]);
  function handleSearchChange(value) {
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
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setItems((prev) => prev.filter((m) => m.id !== id));
        if (previewMedia?.id === id) setPreviewMedia(null);
      }
    } catch {
    }
  }
  function handleUploaded() {
    fetchMedia(void 0, search);
  }
  const clearBtnStyle = {
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
    display: searchInput ? "block" : "none"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: containerStyle, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: toolbarStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: searchWrapStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search files...",
            value: searchInput,
            onChange: (e) => handleSearchChange(e.target.value),
            style: searchInputStyle
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: clearSearch,
            style: clearBtnStyle,
            "aria-label": "Clear search",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: uploadBtnStyle, onClick: () => setUploadOpen(true), children: "+ Upload" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: loadingMoreStyle, children: "Loading..." }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: emptyStyle, children: "No media files yet. Upload your first file!" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: gridStyle, children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: cardStyle,
          onClick: () => setPreviewMedia(item),
          onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "var(--color-brand-400)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            const btn = e.currentTarget.querySelector("button");
            if (btn) btn.style.opacity = "1";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
            const btn = e.currentTarget.querySelector("button");
            if (btn) btn.style.opacity = "0";
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                style: deleteBtnStyle,
                onClick: (e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                },
                "aria-label": "Delete file",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "3 6 5 6 21 6" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: thumbWrapStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: getOptimizedImageUrl(item.key, { width: 300, quality: 80 }),
                alt: item.filename,
                loading: "lazy",
                style: imgStyle
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: infoStyle, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: filenameStyle, title: item.filename, children: item.filename }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: sizeStyle, children: formatFileSize(item.size) })
            ] })
          ]
        },
        item.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: sentinelRef, style: { height: 1 } }),
      loadingMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: loadingMoreStyle, children: "Loading more..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UploadModal,
      {
        open: uploadOpen,
        onClose: () => setUploadOpen(false),
        onUploaded: handleUploaded
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MediaPreviewModal,
      {
        open: !!previewMedia,
        onClose: () => setPreviewMedia(null),
        media: previewMedia,
        onDelete: handleDelete
      }
    ) })
  ] });
}
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Media Library — Admin", "currentPath": "/admin/media" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ErrorBoundary", ErrorBoundary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/ErrorBoundary", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "MediaLibrary", MediaLibrary, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/workspace/src/components/admin/media/MediaLibrary", "client:component-export": "default" })} ` })} ` })}`;
}, "/workspace/src/pages/admin/media/index.astro", void 0);
const $$file = "/workspace/src/pages/admin/media/index.astro";
const $$url = "/admin/media";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
const index___astro = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  page
}, Symbol.toStringTag, { value: "Module" }));
export {
  formatFileSize as f,
  getOptimizedImageUrl as g,
  index___astro as i
};
