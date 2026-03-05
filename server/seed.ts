import { db } from "./db";
import { users, members, finances, events } from "@shared/schema";
import { setupAuth } from "./auth";
import express from "express";

async function seed() {
  console.log("Seeding database...");
  const app = express();
  const { hashPassword } = setupAuth(app);

  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    const password = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: password,
    });
    console.log("Created admin user (admin / admin123)");
  }

  const existingMembers = await db.select().from(members);
  if (existingMembers.length === 0) {
    const [m1] = await db.insert(members).values([
      { name: "João Silva", email: "joao@email.com", phone: "11999999999", role: "membro", birthDate: new Date("1990-05-15") },
      { name: "Maria Oliveira", email: "maria@email.com", phone: "11988888888", role: "lider", birthDate: new Date("1985-08-22") },
      { name: "Pastor Marcos", email: "pastor@email.com", phone: "11977777777", role: "pastor", birthDate: new Date("1978-02-10") },
    ]).returning();
    
    console.log("Created members");

    await db.insert(finances).values([
      { type: "dizimo", amount: 15000, date: new Date(), paymentMethod: "pix", memberId: m1.id },
      { type: "oferta", amount: 5000, date: new Date(), paymentMethod: "dinheiro", memberId: null },
    ]);
    console.log("Created finances");
  }

  const existingEvents = await db.select().from(events);
  if (existingEvents.length === 0) {
    await db.insert(events).values([
      { name: "Culto de Domingo", date: new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()))), description: "Culto principal da família" },
      { name: "Estudo Bíblico", date: new Date(new Date().setDate(new Date().getDate() + (3 - new Date().getDay()))), description: "Estudo sobre o livro de Romanos" },
    ]);
    console.log("Created events");
  }

  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
