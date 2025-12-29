import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, integer, decimal, serial, jsonb } from "drizzle-orm/pg-core";

// --- USER & AUTH TABLES ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_userId_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
}, (table) => [index("account_userId_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

// --- EXAM TABLES ---

// 1. Mock Details
export const mockDetails = pgTable("mock_details", {
  // Changed to 'serial' because your other tables expect an Integer reference
  id: serial("id").primaryKey(), 
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  testName: text("test_name").notNull(),
  examType: text("exam_type").notNull(),
  examTime: integer("exam_time").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  marksPerQuestion: decimal("marks_per_question").notNull(),
  negativeMarks: decimal("negative_marks").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// 2. Mock Sections (Moved OUTSIDE of mockDetails)
export const mockSections = pgTable("mock_sections", {
  id: serial("id").primaryKey(),
  mockId: integer("mock_id").notNull().references(() => mockDetails.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Mock Questions
export const mockQuestions = pgTable("mock_questions", {
  id: serial("id").primaryKey(),
  mockId: integer("mock_id").notNull().references(() => mockDetails.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => mockSections.id, { onDelete: "cascade" }),
  questionHtml: text("question_html").notNull(),
  options: jsonb("options").notNull(),
  correctOption: text("correct_option").notNull(),
  solutionHtml: text("solution_html"),
  order: integer("order").notNull(),
  positiveMarks: text("positive_marks"),
  negativeMarks: text("negative_marks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONS ---

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  mocks: many(mockDetails),
}));

export const mockDetailsRelations = relations(mockDetails, ({ one, many }) => ({
  user: one(user, { fields: [mockDetails.userId], references: [user.id] }),
  sections: many(mockSections),
  questions: many(mockQuestions),
}));

export const mockSectionsRelations = relations(mockSections, ({ one, many }) => ({
  mock: one(mockDetails, { fields: [mockSections.mockId], references: [mockDetails.id] }),
  questions: many(mockQuestions),
}));

export const mockQuestionsRelations = relations(mockQuestions, ({ one }) => ({
  mock: one(mockDetails, { fields: [mockQuestions.mockId], references: [mockDetails.id] }),
  section: one(mockSections, { fields: [mockQuestions.sectionId], references: [mockSections.id] }),
}));

// Export everything in schema object
export const schema = {
  user,
  session,
  account,
  verification,
  mockDetails,
  mockSections, // Added this
  mockQuestions, // Added this
  userRelations,
  sessionRelations,
  accountRelations,
  mockDetailsRelations,
  mockSectionsRelations,
  mockQuestionsRelations,
};