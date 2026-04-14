globalThis.process ??= {};
globalThis.process.env ??= {};
import { o as object, s as string, a as array, _ as _enum, b as boolean } from "./sequence_IbtNAemG.mjs";
const createProductSchema = object({
  name: string().min(1, "Product name is required").max(200),
  summary: string().max(500).optional().default(""),
  description: string().optional().default(""),
  published: boolean().optional().default(false),
  categoryId: string().nullable().optional().default(null)
});
const updateProductSchema = createProductSchema.partial().omit({});
const createNewsSchema = object({
  title: string().min(1, "Title is required").max(300),
  summary: string().max(500).optional().default(""),
  content: string().optional().default(""),
  status: _enum(["draft", "published"]).optional().default("draft"),
  tagIds: array(string()).optional().default([])
});
const updateNewsSchema = createNewsSchema.partial().omit({});
const createTagSchema = object({
  name: string().min(1, "Tag name is required").max(100),
  slug: string().min(1, "Slug is required").max(100).optional()
});
createTagSchema.partial();
const createCategorySchema = object({
  name: string().min(1, "Category name is required").max(100),
  slug: string().min(1, "Slug is required").max(100).optional(),
  description: string().max(500).optional().default("")
});
createCategorySchema.partial();
const createCommentSchema = object({
  postId: string().min(1, "Post ID is required"),
  parentId: string().optional().default(""),
  authorName: string().min(1, "Name is required").max(100),
  authorEmail: string().email("Valid email is required").max(200),
  content: string().min(1, "Comment content is required").max(5e3)
});
const createSolutionSchema = object({
  title: string().min(1, "Title is required").max(300),
  industry: string().min(1, "Industry is required").max(100),
  content: string().optional().default("")
});
const updateSolutionSchema = createSolutionSchema.partial();
const createQuoteRequestSchema = object({
  email: string().email("Valid email is required").max(200),
  name: string().max(100).optional().default(""),
  company: string().max(200).optional().default(""),
  phone: string().max(50).optional().default(""),
  product: string().max(200).optional().default(""),
  message: string().min(1, "Message is required").max(5e3)
});
object({
  key: string().min(1),
  value: string()
});
function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join("; ");
    return { error: message };
  }
  return { data: result.data };
}
export {
  createNewsSchema as a,
  createCategorySchema as b,
  createCommentSchema as c,
  updateProductSchema as d,
  createProductSchema as e,
  createQuoteRequestSchema as f,
  updateSolutionSchema as g,
  createSolutionSchema as h,
  createTagSchema as i,
  updateNewsSchema as u,
  validateBody as v
};
