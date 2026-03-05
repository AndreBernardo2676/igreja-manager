import { z } from "zod";
import { insertUserSchema, insertMemberSchema, insertFinanceSchema, insertEventSchema, users, members, finances, events } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/auth/login" as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: "POST" as const,
      path: "/api/auth/register" as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  dashboard: {
    stats: {
      method: "GET" as const,
      path: "/api/dashboard/stats" as const,
      responses: {
        200: z.object({
          totalMembers: z.number(),
          monthlyFinances: z.number(), // in cents
          totalEvents: z.number(),
        }),
      }
    }
  },
  members: {
    list: {
      method: "GET" as const,
      path: "/api/members" as const,
      responses: {
        200: z.array(z.custom<typeof members.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/members" as const,
      input: insertMemberSchema,
      responses: {
        201: z.custom<typeof members.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/members/:id" as const,
      input: insertMemberSchema.partial(),
      responses: {
        200: z.custom<typeof members.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/members/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  finances: {
    list: {
      method: "GET" as const,
      path: "/api/finances" as const,
      responses: {
        200: z.array(z.custom<typeof finances.$inferSelect>()),
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/finances" as const,
      input: insertFinanceSchema,
      responses: {
        201: z.custom<typeof finances.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/finances/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  },
  events: {
    list: {
      method: "GET" as const,
      path: "/api/events" as const,
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/events" as const,
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/events/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
