import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  avatar: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const restaurants = pgTable("restaurants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull(),
  statusMessage: text("status_message"),
  isActive: boolean("is_active").default(true),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurants.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url"),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export interface DashboardMetrics {
  todayRevenue: number;
  ordersCount: number;
  averageCheck: number;
  newGuests: number;
}

export type DateFilterType = "today" | "custom" | "all";

export interface DateFilter {
  type: DateFilterType;
  startDate?: string;
  endDate?: string;
}

export interface LearningProgress {
  completedPercent: number;
  newLessons: number;
  checklists: number;
}

export interface OrdersChartData {
  label: string;
  orders: number;
}

export interface OrdersChartResponse {
  data: OrdersChartData[];
  period: string;
}

export * from "./models/chat";
