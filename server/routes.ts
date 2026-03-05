import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe", field: "username" });
      }
      
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        next(err);
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      return res.status(200).json(req.user);
    }
    res.status(401).json({ message: "Unauthorized" });
  });

  // Middleware to protect routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Dashboard Stats
  app.get(api.dashboard.stats.path, requireAuth, async (req, res) => {
    const allMembers = await storage.getMembers();
    const allFinances = await storage.getFinances();
    const allEvents = await storage.getEvents();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyFinances = allFinances
      .filter(f => {
        const date = new Date(f.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      totalMembers: allMembers.length,
      monthlyFinances,
      totalEvents: allEvents.length,
    });
  });

  // Members
  app.get(api.members.list.path, requireAuth, async (req, res) => {
    const members = await storage.getMembers();
    res.json(members);
  });

  app.post(api.members.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.members.create.input.parse({
        ...req.body,
        birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined
      });
      const member = await storage.createMember(input);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
    }
  });

  app.put(api.members.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.members.update.input.parse({
        ...req.body,
        birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined
      });
      const member = await storage.updateMember(Number(req.params.id), input);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.status(200).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
    }
  });

  app.delete(api.members.delete.path, requireAuth, async (req, res) => {
    await storage.deleteMember(Number(req.params.id));
    res.status(204).end();
  });

  // Finances
  app.get(api.finances.list.path, requireAuth, async (req, res) => {
    const finances = await storage.getFinances();
    res.json(finances);
  });

  app.post(api.finances.create.path, requireAuth, async (req, res) => {
    try {
      const bodySchema = api.finances.create.input.extend({
        amount: z.coerce.number(),
        memberId: z.coerce.number().optional().nullable(),
      });
      
      const inputRaw = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : new Date()
      };
      if (inputRaw.memberId === "") inputRaw.memberId = null;

      const input = bodySchema.parse(inputRaw);
      const finance = await storage.createFinance(input);
      res.status(201).json(finance);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
    }
  });

  app.delete(api.finances.delete.path, requireAuth, async (req, res) => {
    await storage.deleteFinance(Number(req.params.id));
    res.status(204).end();
  });

  // Events
  app.get(api.events.list.path, requireAuth, async (req, res) => {
    const eventsList = await storage.getEvents();
    res.json(eventsList);
  });

  app.post(api.events.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.events.create.input.parse({
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      });
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
    }
  });

  app.delete(api.events.delete.path, requireAuth, async (req, res) => {
    await storage.deleteEvent(Number(req.params.id));
    res.status(204).end();
  });

  return httpServer;
}
