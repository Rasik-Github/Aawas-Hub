import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { Appointment, AppointmentForm, AppointmentStatus } from "@/types";

export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all] as const,
  detail: (id: string) => ["appointment", id] as const,
};

export const appointmentQuery = (id: string) =>
  queryOptions<Appointment>({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/appointments/${id}`);
      if (!res.ok) throw new Error("Failed to fetch appointment");
      return res.json();
    },
    enabled: !!id,
  });

export const useAppointment = (id: string) => useQuery(appointmentQuery(id));

export const useCreateAppointment = () =>
  useMutation({
    mutationFn: async (data: AppointmentForm) => {
      const res = await fetch("/api/appointments/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create appointment");
      }
      return res.json();
    },
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: appointmentKeys.lists() });
      getQueryClient().invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

export const useUpdateAppointment = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppointmentForm }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      getQueryClient().invalidateQueries({ queryKey: appointmentKeys.lists() });
      getQueryClient().invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      getQueryClient().invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

export const useUpdateAppointmentStatus = () =>
  useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: AppointmentStatus;
      notes: string | undefined;
    }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      getQueryClient().invalidateQueries({ queryKey: appointmentKeys.lists() });
      getQueryClient().invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      getQueryClient().invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

export const useDeleteAppointment = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete appointment");
      return res.json();
    },
    onSuccess: (_, id) => {
      getQueryClient().invalidateQueries({ queryKey: appointmentKeys.lists() });
      getQueryClient().removeQueries({ queryKey: appointmentKeys.detail(id) });
      getQueryClient().invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
