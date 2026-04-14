globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CI7s2FZ6.mjs";
import { r as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./sequence_IbtNAemG.mjs";
import { a as renderComponent } from "./worker-entry_BCrPo2Ie.mjs";
import { r as renderScript } from "./global_BWbwOV2p.mjs";
import { $ as $$AdminLayout } from "./AdminLayout_u2NsupaD.mjs";
import { g as getDBFromEnv, c as comments, s as sql } from "./index_BdvyDh_N.mjs";
import { g as getEnv } from "./env_BQ1v_eSK.mjs";
import { c as count } from "./aggregate_C5aFahLf.mjs";
const prerender = false;
const $$Comments = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Comments;
  const PAGE_SIZE = 20;
  const currentPage = Math.max(1, parseInt(Astro2.url.searchParams.get("page") || "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  let commentsList = [];
  let totalItems = 0;
  try {
    const env = await getEnv();
    const db = getDBFromEnv(env);
    if (db) {
      const [{ total }] = await db.select({ total: count() }).from(comments);
      totalItems = total;
      commentsList = await db.select({ id: comments.id, authorName: comments.authorName, content: comments.content, status: comments.status, createdAt: comments.createdAt, postId: comments.postId }).from(comments).orderBy(sql`${comments.createdAt} desc`).limit(PAGE_SIZE).offset(offset);
    }
  } catch {
  }
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const basePath = "/admin/news/comments";
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Comments — Admin", "currentPath": "/admin/news/comments", "data-astro-cid-etck6izv": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div data-astro-cid-etck6izv> <h1 class="heading-1" style="margin-bottom: 1.5rem;" data-astro-cid-etck6izv>Comment Moderation</h1> <div class="admin-table-wrap" data-astro-cid-etck6izv> <table class="admin-table" data-astro-cid-etck6izv> <thead data-astro-cid-etck6izv><tr data-astro-cid-etck6izv><th data-astro-cid-etck6izv>Author</th><th data-astro-cid-etck6izv>Comment</th><th data-astro-cid-etck6izv>Status</th><th data-astro-cid-etck6izv>Date</th><th data-astro-cid-etck6izv>Actions</th></tr></thead> <tbody id="comments-tbody" data-astro-cid-etck6izv> ${commentsList.length > 0 ? commentsList.map((c) => renderTemplate`<tr${addAttribute(c.id, "data-id")} data-astro-cid-etck6izv> <td style="white-space: nowrap;" data-astro-cid-etck6izv>${c.authorName}</td> <td style="max-width: 20rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"${addAttribute(c.content, "title")} data-astro-cid-etck6izv>${c.content}</td> <td data-astro-cid-etck6izv><span class="badge-gray" data-role="status" data-astro-cid-etck6izv>${c.status || "pending"}</span></td> <td style="white-space: nowrap;" data-astro-cid-etck6izv>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td> <td style="white-space: nowrap;" data-astro-cid-etck6izv> <button class="btn-action btn-approve" data-action="approve"${addAttribute(c.status === "approved", "disabled")} data-astro-cid-etck6izv>Approve</button> <button class="btn-action btn-reject" data-action="reject"${addAttribute(c.status === "rejected", "disabled")} data-astro-cid-etck6izv>Reject</button> <button class="btn-action btn-delete" data-action="delete" data-astro-cid-etck6izv>Delete</button> </td> </tr>`) : renderTemplate`<tr data-astro-cid-etck6izv><td colspan="5" class="empty-cell" data-astro-cid-etck6izv>No comments to moderate.</td></tr>`} </tbody> </table> </div> ${totalPages > 1 && renderTemplate`<nav class="pagination" data-astro-cid-etck6izv> ${currentPage > 1 && renderTemplate`<a${addAttribute(`${basePath}?page=${currentPage - 1}`, "href")} class="page-btn" data-astro-cid-etck6izv>&larr; Prev</a>`} <span class="page-info" data-astro-cid-etck6izv>Page ${currentPage} of ${totalPages} (${totalItems} total)</span> ${currentPage < totalPages && renderTemplate`<a${addAttribute(`${basePath}?page=${currentPage + 1}`, "href")} class="page-btn" data-astro-cid-etck6izv>Next &rarr;</a>`} </nav>`} </div> ` })} ${renderScript($$result, "/workspace/src/pages/admin/news/comments.astro?astro&type=script&index=0&lang.ts")}`;
}, "/workspace/src/pages/admin/news/comments.astro", void 0);
const $$file = "/workspace/src/pages/admin/news/comments.astro";
const $$url = "/admin/news/comments";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Comments,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
