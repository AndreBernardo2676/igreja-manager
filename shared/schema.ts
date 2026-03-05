import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  birthDate: timestamp("birth_date"),
  role: text("role").notNull().default("membro"), 
});

export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), 
  amount: integer("amount").notNull(), 
  date: timestamp("date").notNull(),
  paymentMethod: text("payment_method").notNull(), 
  memberId: integer("member_id").references(() => members.id), 
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export const insertFinanceSchema = createInsertSchema(finances).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Finance = typeof finances.$inferSelect;
export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
