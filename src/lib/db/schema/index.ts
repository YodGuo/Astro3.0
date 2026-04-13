import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";
import { relations } from "drizzle-orm";

// ── Users (managed by Better Auth) ──────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(
    false
  ),
  image: text("image"),
  role: text("role").default("user"), // "admin" | "user" (CHECK enforced in DB via migration 0008)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Product categories ──────────────────────────
export const productCategories = sqliteTable("product_categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: text("parent_id").references(() => productCategories.id),
  order: integer("order").default(0),
}) as unknown as ReturnType<typeof sqliteTable>;

// ── Products ────────────────────────────────────
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: text("category_id").references(() => productCategories.id),
  name: text("name").notNull(),
  summary: text("summary"),
  description: text("description"),
  specs: text("specs", { mode: "json" }).$type<
    Array<{ label: string; value: string }>
  >(),
  features: text("features", { mode: "json" }).$type<string[]>(),
  datasheetUrl: text("datasheet_url"),
  imageUrl: text("image_url"),
  images: text("images", { mode: "json" }).$type<string[]>(),
  published: integer("published", { mode: "boolean" }).default(false),
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Solutions ───────────────────────────────────
export const solutions = sqliteTable("solutions", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  industry: text("industry").notNull(),
  title: text("title").notNull(),
  content: text("content"),
});

// ── Quote requests ──────────────────────────────
export const quoteRequests = sqliteTable("quote_requests", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  phone: text("phone"),
  product: text("product"),
  message: text("message").notNull(),
  status: text("status").default("new"), // new, contacted, quoted, closed (CHECK enforced in DB via migration 0008)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── News posts ──────────────────────────────────
export const newsPosts = sqliteTable("news_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"), // Tiptap JSON AST
  status: text("status").default("draft"), // draft, published (CHECK enforced in DB via migration 0008)
  publishedAt: integer("published_at"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Tags ────────────────────────────────────────
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const newsPostTags = sqliteTable(
  "news_post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => newsPosts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
  ]
);

// ── Comments ────────────────────────────────────
export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => newsPosts.id),
  parentId: text("parent_id").references(() => comments.id),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  status: text("status").default("pending"), // pending, approved, rejected (CHECK enforced in DB via migration 0008)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
}) as unknown as ReturnType<typeof sqliteTable>;

// ── Media ───────────────────────────────────────
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Relations ───────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
}));

export const productCategoriesRelations = relations(
  productCategories,
  ({ one, many }) => ({
    parent: one(productCategories, {
      fields: [productCategories.parentId],
      references: [productCategories.id],
      relationName: "categoryHierarchy",
    }),
    children: many(productCategories, {
      relationName: "categoryHierarchy",
    }),
    products: many(products),
  })
);

export const newsPostsRelations = relations(newsPosts, ({ many }) => ({
  tags: many(newsPostTags),
  comments: many(comments),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(newsPostTags),
}));

export const newsPostTagsRelations = relations(newsPostTags, ({ one }) => ({
  post: one(newsPosts, {
    fields: [newsPostTags.postId],
    references: [newsPosts.id],
  }),
  tag: one(tags, {
    fields: [newsPostTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(newsPosts, {
    fields: [comments.postId],
    references: [newsPosts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, { relationName: "commentReplies" }),
}));

// ── Notification Channels ────────────────────────
export const notificationChannels = sqliteTable("notification_channels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "email" | "webhook"
  config: text("config", { mode: "json" }).$type<Record<string, unknown>>(),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Notification Subscriptions ───────────────────
export const notificationSubscriptions = sqliteTable("notification_subscriptions", {
  id: text("id").primaryKey(),
  channelId: text("channel_id")
    .notNull()
    .references(() => notificationChannels.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Notification Logs ────────────────────────────
export const notificationLogs = sqliteTable("notification_logs", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  channelId: text("channel_id")
    .references(() => notificationChannels.id),
  channelType: text("channel_type").notNull(), // "email" | "webhook"
  status: text("status").notNull(), // "sent" | "failed" | "skipped"
  recipient: text("recipient"),
  errorMessage: text("error_message"),
  eventData: text("event_data", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Site Settings (KV-style in D1) ───────────────
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default("true"),
});

// ── Page Sections (CMS-manageable content blocks) ──
export const pageSections = sqliteTable("page_sections", {
  id: text("id").primaryKey(),
  page: text("page").notNull(),
  section: text("section").notNull(),
  field: text("field").notNull(),
  value: text("value").notNull().default(""),
  order: integer("order").default(0),
});

// ── Notification Settings (KV-style in D1) ───────
export const notificationSettings = sqliteTable("notification_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON string
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ── Notification Relations ───────────────────────
export const notificationChannelsRelations = relations(notificationChannels, ({ many }) => ({
  subscriptions: many(notificationSubscriptions),
}));

export const notificationSubscriptionsRelations = relations(notificationSubscriptions, ({ one }) => ({
  channel: one(notificationChannels, {
    fields: [notificationSubscriptions.channelId],
    references: [notificationChannels.id],
  }),
}));
