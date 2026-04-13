import { useState, useEffect, lazy, Suspense } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
const MediaPicker = lazy(() => import("./media/MediaPicker"));

interface NewsFormProps { mode?: "create" | "edit"; articleId?: string; }

interface Tag {
  id: string;
  name: string;
  slug: string;
}

function Toolbar({ editor, onImageClick }: { editor: ReturnType<typeof useEditor>; onImageClick: () => void }) {
  if (!editor) return null;
  const btnStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "0.875rem" };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-subtle)", padding: "0.375rem 0.5rem" }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} style={btnStyle} title="Bold"><strong>B</strong></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} style={btnStyle} title="Italic"><em>I</em></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} style={btnStyle} title="Strikethrough"><s>S</s></button>
      <div style={{ width: "1px", height: "1.25rem", background: "var(--color-border)", margin: "0 0.25rem" }} />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle} title="H2">H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle} title="H3">H3</button>
      <div style={{ width: "1px", height: "1.25rem", background: "var(--color-border)", margin: "0 0.25rem" }} />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle} title="Bullet list">•≡</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle} title="Ordered list">1.</button>
      <div style={{ width: "1px", height: "1.25rem", background: "var(--color-border)", margin: "0 0.25rem" }} />
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle} title="Blockquote">"</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={btnStyle} title="Code block">{"</>"}</button>
      <button type="button" onClick={onImageClick} style={btnStyle} title="Insert image from media library">🖼</button>
    </div>
  );
}

export default function NewsForm({ mode = "create", articleId }: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Tags state
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] } }), Image.configure({ inline: true }), Link.configure({ openOnClick: false }), Placeholder.configure({ placeholder: "Start writing..." })],
    onUpdate: () => {},
    editorProps: { attributes: { style: "min-height: 300px; outline: none; padding: 0.25rem 0.5rem; font-size: 0.875rem; line-height: 1.6;" } },
  });

  // Load all tags
  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json() as Promise<Record<string, unknown>>)
      .then((data) => {
        if (data.data) setAllTags(data.data as Tag[]);
      })
      .catch(() => {});
  }, []);

  // In edit mode, load article and its tags in parallel (async-parallel)
  useEffect(() => {
    if (mode === "edit" && articleId) {
      Promise.all([
        fetch(`/api/news/${articleId}/tags`).then((res) => res.json() as Promise<Record<string, unknown>>),
        fetch(`/api/news/${articleId}`).then((res) => res.json() as Promise<Record<string, unknown>>),
      ]).then(([tagsData, articleData]) => {
        if (tagsData.data) {
          setSelectedTagIds(new Set((tagsData.data as Tag[]).map((t: Tag) => t.id)));
        }
        if (articleData.error) { setError(articleData.error as string); return; }
        setTitle((articleData.title as string) || ""); setSummary((articleData.summary as string) || "");
        if (articleData.content && editor) { try { editor.commands.setContent(typeof articleData.content === "string" ? JSON.parse(articleData.content as string) : articleData.content); } catch { /* ignore */ } }
      }).catch((err) => setError(err.message)).finally(() => setLoading(false));
    }
  }, [mode, articleId, editor]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published" = "draft") => {
    e.preventDefault(); if (!editor) return;
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      const content = editor.getJSON();
      const url = mode === "edit" && articleId ? `/api/news/${articleId}` : "/api/news";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, summary, content, status }) });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) { setError(data.error as string || "Failed"); return; }

      // Save tags association (works for both create and edit)
      const postId = mode === "edit" ? articleId : (data.id as string);
      if (postId) {
        await fetch(`/api/news/${postId}/tags`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tagIds: Array.from(selectedTagIds) }),
        });
      }

      const label = status === "published" ? "published" : (mode === "edit" ? "updated" : `created as draft`);
      setSuccess(mode === "edit" ? `Article ${label}!` : `Article "${data.slug as string}" ${label}!`);
      if (mode === "create") { setTitle(""); setSummary(""); editor.commands.clearContent(); setSelectedTagIds(new Set()); }
    } catch (err) { setError(err instanceof Error ? err.message : "Network error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <p style={{ color: "var(--color-text-tertiary)" }}>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {success ? <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", color: "#15803d", fontSize: "0.875rem" }}>{success}</div> : null}
      {error ? <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>{error}</div> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" required style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="Brief summary" style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid var(--color-border)", fontSize: "0.875rem", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Content</label>
        <div style={{ borderRadius: "12px", border: "1px solid var(--color-border)", overflow: "hidden" }}>
          {editor && <Toolbar editor={editor} onImageClick={() => setShowMediaPicker(true)} />}
          <div style={{ padding: "1rem", background: "var(--color-surface)" }}><EditorContent editor={editor} /></div>
        </div>
      </div>
      {/* Tags selector */}
      {allTags.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Tags</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {allTags.map((tag) => {
              const selected = selectedTagIds.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    padding: "0.25rem 0.625rem",
                    borderRadius: "9999px",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    border: selected ? "1px solid var(--color-brand-600, #2563eb)" : "1px solid var(--color-border)",
                    background: selected ? "var(--color-brand-600, #2563eb)" : "var(--color-surface)",
                    color: selected ? "#fff" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    transition: "background 0.15s, color 0.15s, border-color 0.15s",
                  }}
                >
                  {selected ? "✓ " : ""}{tag.name}
                </button>
              );
            })}
          </div>
          {selectedTagIds.size > 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", margin: 0 }}>
              {selectedTagIds.size} tag{selectedTagIds.size > 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button type="submit" disabled={submitting || !editor} onClick={(e) => handleSubmit(e, "draft")} style={{ padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, background: "var(--color-brand-600)", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Saving..." : mode === "create" ? "Save as Draft" : "Update (Draft)"}
        </button>
        <button type="submit" disabled={submitting || !editor} onClick={(e) => handleSubmit(e, "published")} style={{ padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, background: "#059669", color: "#fff", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Publishing..." : mode === "create" ? "Save & Publish" : "Update & Publish"}
        </button>
      </div>
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading media library...</div>}>
        <MediaPicker
          open={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={(url) => {
            if (editor) editor.chain().focus().setImage({ src: url }).run();
            setShowMediaPicker(false);
          }}
        />
      </Suspense>
    </form>
  );
}
