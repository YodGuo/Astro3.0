import React, { useState, useRef, useCallback, useEffect } from "react";

// ── Types ────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

type FileStatus = "WAITING" | "UPLOADING" | "DONE" | "ERROR";

interface UploadEntry {
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// ── Static Styles ────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  borderRadius: "12px",
  border: "1px solid var(--color-border)",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 1.25rem",
  borderBottom: "1px solid var(--color-border)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  margin: 0,
  color: "var(--color-text-primary)",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "1.25rem",
  cursor: "pointer",
  color: "var(--color-text-tertiary)",
  padding: "0.25rem",
  lineHeight: 1,
};

const bodyStyle: React.CSSProperties = {
  padding: "1.25rem",
  overflowY: "auto",
  flex: 1,
};

const dropTextStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-text-secondary)",
  margin: "0 0 0.75rem",
};

const chooseBtnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  background: "var(--color-brand-600)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const queueListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const queueItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0.5rem 0.625rem",
  borderRadius: "8px",
  background: "var(--color-surface-subtle)",
  fontSize: "0.8125rem",
};

const progressBarBgStyle: React.CSSProperties = {
  flex: 1,
  height: "4px",
  background: "var(--color-border)",
  borderRadius: "2px",
  overflow: "hidden",
};

// ── Component ────────────────────────────────────────

export default function UploadModal({ open, onClose, onUploaded }: UploadModalProps) {
  const [queue, setQueue] = useState<UploadEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setQueue([]);
      setDragOver(false);
      isProcessingRef.current = false;
    }
  }, [open]);

  // ── Validate files ───────────────────────────────

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) {
      return `Unsupported file type: ${file.type || "unknown"}. Allowed: JPEG, PNG, GIF, WebP`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB`;
    }
    return null;
  }

  // ── Add files to queue ───────────────────────────

  function addFiles(files: FileList | File[]) {
    const newEntries: UploadEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      newEntries.push({
        file,
        status: error ? "ERROR" : "WAITING",
        progress: 0,
        error: error ?? undefined,
      });
    }
    setQueue((prev) => [...prev, ...newEntries]);
  }

  // ── Upload a single file via XMLHttpRequest ──────

  function uploadFile(entry: UploadEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", entry.file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setQueue((prev) =>
            prev.map((item) =>
              item.file === entry.file ? { ...item, progress: pct } : item
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload aborted"));
      });

      xhr.open("POST", "/api/media");
      xhr.send(formData);
    });
  }

  // ── Process queue sequentially ───────────────────

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Find the first WAITING entry
    let idx = -1;
    setQueue((prev) => {
      idx = prev.findIndex((e) => e.status === "WAITING");
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: "UPLOADING", progress: 0 };
      return updated;
    });

    // We need to re-read the queue to get the actual entry
    // Use a different approach: read from state after update
    while (true) {
      // Find next WAITING item
      const currentQueue = await new Promise<UploadEntry[]>((resolve) => {
        setQueue((prev) => {
          resolve(prev);
          return prev;
        });
      });

      const waitingIdx = currentQueue.findIndex((e) => e.status === "WAITING");
      if (waitingIdx === -1) break;

      const entry = currentQueue[waitingIdx];

      // Mark as UPLOADING
      setQueue((prev) =>
        prev.map((e, i) => (i === waitingIdx ? { ...e, status: "UPLOADING" as FileStatus, progress: 0 } : e))
      );

      try {
        await uploadFile(entry);
        setQueue((prev) =>
          prev.map((e) => (e.file === entry.file ? { ...e, status: "DONE" as FileStatus, progress: 100 } : e))
        );
      } catch (err) {
        setQueue((prev) =>
          prev.map((e) =>
            e.file === entry.file
              ? { ...e, status: "ERROR" as FileStatus, error: err instanceof Error ? err.message : "Upload failed" }
              : e
          )
        );
      }
    }

    isProcessingRef.current = false;

    // Check if all done
    setQueue((prev) => {
      const allDone = prev.every((e) => e.status === "DONE" || e.status === "ERROR");
      if (allDone && prev.length > 0) {
        // Notify parent after a short delay so user can see the results
        setTimeout(() => {
          onUploaded();
        }, 500);
      }
      return prev;
    });
  }, [onUploaded]);

  // Start processing whenever new WAITING items appear
  useEffect(() => {
    if (!open) return;
    const hasWaiting = queue.some((e) => e.status === "WAITING");
    if (hasWaiting && !isProcessingRef.current) {
      processQueue();
    }
  }, [queue, open, processQueue]);

  // ── Drag & drop handlers ─────────────────────────

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input so the same file can be selected again
      e.target.value = "";
    }
  }

  // ── Dynamic Styles (depend on state) ─────────────

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${dragOver ? "var(--color-brand-500)" : "var(--color-border)"}`,
    borderRadius: "10px",
    padding: "2rem 1rem",
    textAlign: "center",
    background: dragOver ? "var(--color-brand-50, #ecfdf5)" : "var(--color-surface-subtle)",
    transition: "border-color 0.15s ease, background 0.15s ease",
    marginBottom: "1rem",
    cursor: "pointer",
  };

  const progressBarFillStyle = (pct: number, status: FileStatus): React.CSSProperties => ({
    height: "100%",
    width: `${pct}%`,
    borderRadius: "2px",
    background:
      status === "DONE"
        ? "var(--color-brand-500)"
        : status === "ERROR"
        ? "#dc2626"
        : "var(--color-brand-600)",
    transition: "width 0.2s ease",
  });

  const statusLabelStyle = (status: FileStatus): React.CSSProperties => ({
    fontSize: "0.75rem",
    fontWeight: 500,
    color:
      status === "DONE"
        ? "var(--color-brand-600)"
        : status === "ERROR"
        ? "#dc2626"
        : status === "UPLOADING"
        ? "var(--color-text-secondary)"
        : "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
    minWidth: "4.5rem",
    textAlign: "right",
  });

  // ── Render ───────────────────────────────────────

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>Upload Files</h3>
          <button type="button" style={closeBtnStyle} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Drop zone */}
          <div
            style={dropZoneStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <p style={dropTextStyle}>
              Drag &amp; drop files here, or click to browse
            </p>
            <button
              type="button"
              style={chooseBtnStyle}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>

          {/* Upload queue */}
          {queue.length > 0 && (
            <div style={queueListStyle}>
              {queue.map((entry, i) => (
                <div key={`${entry.file.name}-${entry.file.lastModified}-${i}`} style={queueItemStyle}>
                  <span
                    style={{
                      flex: "0 0 auto",
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--color-text-primary)",
                    }}
                    title={entry.file.name}
                  >
                    {entry.file.name}
                  </span>
                  <div style={progressBarBgStyle}>
                    <div style={progressBarFillStyle(entry.progress, entry.status)} />
                  </div>
                  <span style={statusLabelStyle(entry.status)}>
                    {entry.status === "WAITING" && "Waiting"}
                    {entry.status === "UPLOADING" && `${entry.progress}%`}
                    {entry.status === "DONE" && "Done"}
                    {entry.status === "ERROR" && "Error"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
