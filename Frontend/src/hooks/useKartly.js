import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

// ── Catalog ──────────────────────────────────────────────────────────────────

export function useNearestStore(lng, lat) {
  return useQuery({
    queryKey: ["nearest-store", lng, lat],
    queryFn: async () => {
      const res = await api.get(`/catalog/nearest-store?longitude=${lng}&latitude=${lat}`);
      return res.data.data;
    },
    enabled: !!lng && !!lat,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useStoreCatalog(storeId, { category, search } = {}) {
  return useQuery({
    queryKey: ["catalog", storeId, category, search],
    queryFn: async () => {
      const params = new URLSearchParams({ storeId });
      if (category && category !== "all") params.append("category", category);
      if (search) params.append("search", search);
      const res = await api.get(`/catalog/products?${params}`);
      return res.data.data;
    },
    enabled: !!storeId,
    staleTime: 30_000,
  });
}

export function useAllStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await api.get("/catalog/stores");
      return res.data.data;
    },
    staleTime: 120_000,
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function useCustomerOrders() {
  return useQuery({
    queryKey: ["orders", "customer"],
    queryFn: async () => {
      const res = await api.get("/orders/customer/history");
      return res.data.data;
    },
    refetchInterval: 8_000,   // poll every 8s for live status
  });
}

export function useAdminOrders(storeId) {
  return useQuery({
    queryKey: ["orders", "admin", storeId],
    queryFn: async () => {
      const url = storeId
        ? `/orders/admin/all?storeId=${storeId}`
        : "/orders/admin/all";
      const res = await api.get(url);
      return res.data.data;
    },
    refetchInterval: 6_000,
  });
}

export function useRiderDeliveries() {
  return useQuery({
    queryKey: ["orders", "rider"],
    queryFn: async () => {
      const res = await api.get("/orders/rider/available");
      return res.data.data;
    },
    refetchInterval: 5_000,
  });
}

export function useOrderById(id) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    refetchInterval: 4_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/orders", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, otp }) => {
      const res = await api.put(`/orders/${id}/status`, { status, otp });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAssignRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, riderId }) => {
      const res = await api.post(`/orders/${id}/assign`, { riderId });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, productId, stock }) => {
      const res = await api.post("/catalog/update-stock", { storeId, productId, stock });
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["catalog", variables.storeId] });
    },
  });
}
