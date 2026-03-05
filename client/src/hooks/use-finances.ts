import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useFinances() {
  return useQuery({
    queryKey: [api.finances.list.path],
    queryFn: async () => {
      const res = await fetch(api.finances.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch finances");
      const data = await res.json();
      return api.finances.list.responses[200].parse(data);
    },
  });
}

export function useCreateFinance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (financeData: any) => {
      const res = await fetch(api.finances.create.path, {
        method: api.finances.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(financeData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record finance");
      return api.finances.create.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.finances.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useDeleteFinance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.finances.delete.path, { id });
      const res = await fetch(url, {
        method: api.finances.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete finance record");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.finances.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}
