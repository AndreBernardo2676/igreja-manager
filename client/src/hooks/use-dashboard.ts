import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

function parseResponse<T>(schema: any, data: any, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod Error] ${label}:`, result.error.format());
    throw new Error(`Data validation failed for ${label}`);
  }
  return result.data;
}

export function useStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return parseResponse<any>(api.dashboard.stats.responses[200], data, "dashboard.stats");
    },
  });
}
