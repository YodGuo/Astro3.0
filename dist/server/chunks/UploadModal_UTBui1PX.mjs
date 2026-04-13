globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_Bo14_ato.mjs";
import { r as reactExports } from "./worker-entry_BCrPo2Ie.mjs";
const ALLOWED_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
]);
const MAX_SIZE = 5 * 1024 * 1024;
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 1e3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
const modalStyle = {
  background: "var(--color-surface)",
  borderRadius: "12px",
  border: "1px solid var(--color-border)",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
};
const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 1.25rem",
  borderBottom: "1px solid var(--color-border)"
};
const titleStyle = {
  fontSize: "1rem",
  fontWeight: 600,
  margin: 0,
  color: "var(--color-text-primary)"
};
const closeBtnStyle = {
  background: "none",
  border: "none",
  fontSize: "1.25rem",
  cursor: "pointer",
  color: "var(--color-text-tertiary)",
  padding: "0.25rem",
  lineHeight: 1
};
const bodyStyle = {
  padding: "1.25rem",
  overflowY: "auto",
  flex: 1
};
const dropTextStyle = {
  fontSize: "0.875rem",
  color: "var(--color-text-secondary)",
  margin: "0 0 0.75rem"
};
const chooseBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  fontSize: "0.8125rem",
  fontWeight: 500,
  background: "var(--color-brand-600)",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};
const queueListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem"
};
const queueItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0.5rem 0.625rem",
  borderRadius: "8px",
  background: "var(--color-surface-subtle)",
  fontSize: "0.8125rem"
};
const progressBarBgStyle = {
  flex: 1,
  height: "4px",
  background: "var(--color-border)",
  borderRadius: "2px",
  overflow: "hidden"
};
function UploadModal({ open, onClose, onUploaded }) {
  const [queue, setQueue] = reactExports.useState([]);
  const [dragOver, setDragOver] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const isProcessingRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!open) {
      setQueue([]);
      setDragOver(false);
      isProcessingRef.current = false;
    }
  }, [open]);
  function validateFile(file) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return `Unsupported file type: ${file.type || "unknown"}. Allowed: JPEG, PNG, GIF, WebP`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB`;
    }
    return null;
  }
  function addFiles(files) {
    const newEntries = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      newEntries.push({
        file,
        status: error ? "ERROR" : "WAITING",
        progress: 0,
        error: error ?? void 0
      });
    }
    setQueue((prev) => [...prev, ...newEntries]);
  }
  function uploadFile(entry) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", entry.file);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round(e.loaded / e.total * 100);
          setQueue(
            (prev) => prev.map(
              (item) => item.file === entry.file ? { ...item, progress: pct } : item
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
  const processQueue = reactExports.useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    let idx = -1;
    setQueue((prev) => {
      idx = prev.findIndex((e) => e.status === "WAITING");
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: "UPLOADING", progress: 0 };
      return updated;
    });
    while (true) {
      const currentQueue = await new Promise((resolve) => {
        setQueue((prev) => {
          resolve(prev);
          return prev;
        });
      });
      const waitingIdx = currentQueue.findIndex((e) => e.status === "WAITING");
      if (waitingIdx === -1) break;
      const entry = currentQueue[waitingIdx];
      setQueue(
        (prev) => prev.map((e, i) => i === waitingIdx ? { ...e, status: "UPLOADING", progress: 0 } : e)
      );
      try {
        await uploadFile(entry);
        setQueue(
          (prev) => prev.map((e) => e.file === entry.file ? { ...e, status: "DONE", progress: 100 } : e)
        );
      } catch (err) {
        setQueue(
          (prev) => prev.map(
            (e) => e.file === entry.file ? { ...e, status: "ERROR", error: err instanceof Error ? err.message : "Upload failed" } : e
          )
        );
      }
    }
    isProcessingRef.current = false;
    setQueue((prev) => {
      const allDone = prev.every((e) => e.status === "DONE" || e.status === "ERROR");
      if (allDone && prev.length > 0) {
        setTimeout(() => {
          onUploaded();
        }, 500);
      }
      return prev;
    });
  }, [onUploaded]);
  reactExports.useEffect(() => {
    if (!open) return;
    const hasWaiting = queue.some((e) => e.status === "WAITING");
    if (hasWaiting && !isProcessingRef.current) {
      processQueue();
    }
  }, [queue, open, processQueue]);
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }
  function handleFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }
  const dropZoneStyle = {
    border: `2px dashed ${dragOver ? "var(--color-brand-500)" : "var(--color-border)"}`,
    borderRadius: "10px",
    padding: "2rem 1rem",
    textAlign: "center",
    background: dragOver ? "var(--color-brand-50, #ecfdf5)" : "var(--color-surface-subtle)",
    transition: "border-color 0.15s ease, background 0.15s ease",
    marginBottom: "1rem",
    cursor: "pointer"
  };
  const progressBarFillStyle = (pct, status) => ({
    height: "100%",
    width: `${pct}%`,
    borderRadius: "2px",
    background: status === "DONE" ? "var(--color-brand-500)" : status === "ERROR" ? "#dc2626" : "var(--color-brand-600)",
    transition: "width 0.2s ease"
  });
  const statusLabelStyle = (status) => ({
    fontSize: "0.75rem",
    fontWeight: 500,
    color: status === "DONE" ? "var(--color-brand-600)" : status === "ERROR" ? "#dc2626" : status === "UPLOADING" ? "var(--color-text-secondary)" : "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
    minWidth: "4.5rem",
    textAlign: "right"
  });
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: overlayStyle, onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: modalStyle, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: headerStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: titleStyle, children: "Upload Files" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", style: closeBtnStyle, onClick: onClose, "aria-label": "Close", children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: bodyStyle, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: dropZoneStyle,
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
          onClick: () => fileInputRef.current?.click(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: dropTextStyle, children: "Drag & drop files here, or click to browse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                style: chooseBtnStyle,
                onClick: (e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                },
                children: "Choose Files"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: "image/jpeg,image/png,image/gif,image/webp",
                multiple: true,
                style: { display: "none" },
                onChange: handleFileSelect
              }
            )
          ]
        }
      ),
      queue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: queueListStyle, children: queue.map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: queueItemStyle, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            style: {
              flex: "0 0 auto",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--color-text-primary)"
            },
            title: entry.file.name,
            children: entry.file.name
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: progressBarBgStyle, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: progressBarFillStyle(entry.progress, entry.status) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: statusLabelStyle(entry.status), children: [
          entry.status === "WAITING" && "Waiting",
          entry.status === "UPLOADING" && `${entry.progress}%`,
          entry.status === "DONE" && "Done",
          entry.status === "ERROR" && "Error"
        ] })
      ] }, `${entry.file.name}-${entry.file.lastModified}-${i}`)) })
    ] })
  ] }) });
}
export {
  UploadModal as default
};
