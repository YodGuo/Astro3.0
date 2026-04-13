import { z } from "zod";

// ── Products ──────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  summary: z.string().max(500).optional().default(""),
  description: z.string().optional().default(""),
  published: z.boolean().optional().default(false),
  categoryId: z.string().nullable().optional().default(null),
});

export const updateProductSchema = createProductSchema.partial().omit({});

// ── News ──────────────────────────────────────────

export const createNewsSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  summary: z.string().max(500).optional().default(""),
  content: z.string().optional().default(""),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  tagIds: z.array(z.string()).optional().default([]),
});

export const updateNewsSchema = createNewsSchema.partial().omit({});

// ── Tags ──────────────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).optional(),
});

export const updateTagSchema = createTagSchema.partial();

// ── Product Categories ────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).optional(),
  description: z.string().max(500).optional().default(""),
});

export const updateCategorySchema = createCategorySchema.partial();

// ── Comments (public) ─────────────────────────────

export const createCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional().default(""),
  authorName: z.string().min(1, "Name is required").max(100),
  authorEmail: z.string().email("Valid email is required").max(200),
  content: z.string().min(1, "Comment content is required").max(5000),
});

// ── Solutions ──────────────────────────────────────

export const createSolutionSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  industry: z.string().min(1, "Industry is required").max(100),
  content: z.string().optional().default(""),
});

export const updateSolutionSchema = createSolutionSchema.partial();

// ── Quote Requests (public) ───────────────────────

export const createQuoteRequestSchema = z.object({
  email: z.string().email("Valid email is required").max(200),
  name: z.string().max(100).optional().default(""),
  company: z.string().max(200).optional().default(""),
  phone: z.string().max(50).optional().default(""),
  product: z.string().max(200).optional().default(""),
  message: z.string().min(1, "Message is required").max(5000),
});

// ── Settings ──────────────────────────────────────

export const updateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

// ── Helper ────────────────────────────────────────

/**
 * Validate request body against a Zod schema.
 * Returns { data, error } — if error is set, the caller should return a 400 response.
 */
export function validateBody<T>(schema: z.ZodType<T>, body: unknown): { data?: T; error?: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join("; ");
    return { error: message };
  }
  return { data: result.data };
}
