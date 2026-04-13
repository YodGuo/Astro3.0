import React, { useState } from "react";
import { getOptimizedImageUrl, formatFileSize } from "../../../lib/media/utils";
import type { MediaItem } from "./MediaLibrary";

// ── Types ────────────────────────────────────────────

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  media: MediaItem | null;
  onDelete: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Static Styles ────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  borderRadius: "12px",
  border: "1px solid var(--color-border)",
  maxWidth: "800px",
  width: "92%",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.875rem 1.25rem",
  borderBottom: "1px solid var(--color-border)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 600,
  margin: 0,
  color: "var(--color-text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  flex: 1,
  marginRight: "0.75rem",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "1.25rem",
  cursor: "pointer",
  color: "var(--color-text-tertiary)",
  padding: "0.25rem",
  lineHeight: 1,
  flexShrink: 0,
};

const bodyStyle: React.CSSProperties = {
  padding: "1.25rem",
  overflowY: "auto",
  flex: 1,
};

const imageWrapStyle: React.CSSProperties = {
  background: "var(--color-surface-muted)",
  borderRadius: "8px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
  maxHeight: "50vh",
};

const imgStyle: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "50vh",
  objectFit: "contain",
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "0.375rem 1rem",
  fontSize: "0.8125rem",
  marginBottom: "1.25rem",
};

const metaLabelStyle: React.CSSProperties = {
  fontWeight: 500,
  color: "var(--color-text-tertiary)",
  whiteSpace: "nowrap",
};

const metaValueStyle: React.CSSProperties = {
  color: "var(--color-text-primary)",
  wordBreak: "break-all",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.625rem",
  flexWrap: "wrap",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem",
};

const btnBase: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
};

const copyBtnStyle: React.CSSProperties = {
  ...btnBase,
  background: "var(--color-surface-muted)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border)",
};

const downloadBtnStyle: React.CSSProperties = {
  ...btnBase,
  background: "var(--color-brand-600)",
  color: "#fff",
};

const deleteBtnStyle: React.CSSProperties = {
  ...btnBase,
  background: "#dc2626",
  color: "#fff",
  marginLeft: "auto",
};

// ── Component ────────────────────────────────────────

export default function MediaPreviewModal({ open, onClose, media, onDelete }: MediaPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !media) return null;

  // ── Handlers ────────────────────────────────────

  async function handleCopyLink() {
    try {
      const fullUrl = `${window.location.origin}${media.url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = `${window.location.origin}${media.url}`;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDelete() {
    if (window.confirm("Are you sure you want to delete this file?")) {
      onDelete(media.id);
    }
  }

  // ── Render ───────────────────────────────────────

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle} title={media.filename}>
            {media.filename}
          </h3>
          <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Image preview */}
          <div style={imageWrapStyle}>
            <img
              src={getOptimizedImageUrl(media.key, { width: 800, quality: 90 })}
              alt={media.filename}
              style={imgStyle}
            />
          </div>

          {/* Metadata */}
          <div style={metaGridStyle}>
            <span style={metaLabelStyle}>Filename</span>
            <span style={metaValueStyle}>{media.filename}</span>

            <span style={metaLabelStyle}>Type</span>
            <span style={metaValueStyle}>{media.mimeType}</span>

            <span style={metaLabelStyle}>Size</span>
            <span style={metaValueStyle}>{formatFileSize(media.size)}</span>

            <span style={metaLabelStyle}>Uploaded</span>
            <span style={metaValueStyle}>{formatDate(media.createdAt)}</span>
          </div>

          {/* Actions */}
          <div style={actionsStyle}>
            <button type="button" style={copyBtnStyle} onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={`/media/${media.key}`}
              download
              style={{ ...downloadBtnStyle, textDecoration: "none" }}
            >
              Download Original
            </a>
            <button type="button" style={deleteBtnStyle} onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
