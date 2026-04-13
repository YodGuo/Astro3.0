globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
import { r as reactExports } from "./worker-entry_BCrPo2Ie.mjs";
import { g as getOptimizedImageUrl, f as formatFileSize } from "./index_DoOWiGuR.mjs";
function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 1e3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
const modalStyle = {
  background: "var(--color-surface)",
  borderRadius: "12px",
  border: "1px solid var(--color-border)",
  maxWidth: "800px",
  width: "92%",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  overflow: "hidden"
};
const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.875rem 1.25rem",
  borderBottom: "1px solid var(--color-border)"
};
const titleStyle = {
  fontSize: "0.9375rem",
  fontWeight: 600,
  margin: 0,
  color: "var(--color-text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1,
  marginRight: "0.75rem"
};
const closeBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.25rem",
  cursor: "pointer",
  color: "var(--color-text-tertiary)",
  padding: "0.25rem",
  lineHeight: 1,
  flexShrink: 0
};
const bodyStyle = {
  padding: "1.25rem",
  overflowY: "auto",
  flex: 1
};
const imageWrapStyle = {
  background: "var(--color-surface-muted)",
  borderRadius: "8px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
  maxHeight: "50vh"
};
const imgStyle = {
  maxWidth: "100%",
  maxHeight: "50vh",
  objectFit: "contain"
};
const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "0.375rem 1rem",
  fontSize: "0.8125rem",
  marginBottom: "1.25rem"
};
const metaLabelStyle = {
  fontWeight: 500,
  color: "var(--color-text-tertiary)",
  whiteSpace: "nowrap"
};
const metaValueStyle = {
  color: "var(--color-text-primary)",
  wordBreak: "break-all"
};
const actionsStyle = {
  display: "flex",
  gap: "0.625rem",
  flexWrap: "wrap",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem"
};
const btnBase = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem"
};
const copyBtnStyle = {
  ...btnBase,
  background: "var(--color-surface-muted)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border)"
};
const downloadBtnStyle = {
  ...btnBase,
  background: "var(--color-brand-600)",
  color: "#fff"
};
const deleteBtnStyle = {
  ...btnBase,
  background: "#dc2626",
  color: "#fff",
  marginLeft: "auto"
};
function MediaPreviewModal({ open, onClose, media, onDelete }) {
  const [copied, setCopied] = reactExports.useState(false);
  if (!open || !media) return null;
  async function handleCopyLink() {
    try {
      const fullUrl = `${window.location.origin}${media.url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = `${window.location.origin}${media.url}`;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    }
  }
  function handleDelete() {
    if (window.confirm("Are you sure you want to delete this file?")) {
      onDelete(media.id);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: overlayStyle, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: modalStyle, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: headerStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: titleStyle, title: media.filename, children: media.filename }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: closeBtnStyle, onClick: onClose, "aria-label": "Close", children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: bodyStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: imageWrapStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: getOptimizedImageUrl(media.key, { width: 800, quality: 90 }),
          alt: media.filename,
          style: imgStyle
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: metaGridStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaLabelStyle, children: "Filename" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaValueStyle, children: media.filename }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaLabelStyle, children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaValueStyle, children: media.mimeType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaLabelStyle, children: "Size" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaValueStyle, children: formatFileSize(media.size) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaLabelStyle, children: "Uploaded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: metaValueStyle, children: formatDate(media.createdAt) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: actionsStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: copyBtnStyle, onClick: handleCopyLink, children: copied ? "Copied!" : "Copy Link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: `/media/${media.key}`,
            download: true,
            style: { ...downloadBtnStyle, textDecoration: "none" },
            children: "Download Original"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: deleteBtnStyle, onClick: handleDelete, children: "Delete" })
      ] })
    ] })
  ] }) });
}
export {
  MediaPreviewModal as default
};
