"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Calendar, Clock, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateAppointment } from "@/lib/client/queries/appointments.queries";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";

export const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Property Viewing", "Inspection", "Legal Review"]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  propertyId: z.string().min(1, "Property is required"),
  image: z.string().optional(),
});

export type AppointmentForm = z.infer<typeof appointmentSchema>;

function formatDateTime(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function NewAppointmentForm() {
  const router = useRouter();
  const createAppointment = useCreateAppointment();
  const searchParams = useSearchParams();
  const propertyIdFromUrl = searchParams.get("propertyId") ?? "";
  const { data: images = [] } = usePropertyImages(propertyIdFromUrl);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      type: "Property Viewing",
      date: "",
      notes: "",
      propertyId: propertyIdFromUrl,
      image: "",
    },
  });

  useEffect(() => {
    if (images.length === 0) return;
    const current = watch("image");
    if (current !== images[0].url) setValue("image", images[0].url);
  }, [images, setValue, watch]);

  const selectedType = watch("type");
  const selectedDate = watch("date");
  const propertyImage = watch("image");
  const formatted = formatDateTime(selectedDate);

  const onSubmit = (data: AppointmentForm) => {
    createAppointment.mutate(
      { ...data },
      {
        onSuccess: () => {
          toast.success("Appointment booked!");
          router.push("/dashboard");
        },
        onError: (err: any) =>
          toast.error(err?.message || "Failed to book appointment"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

        {/* ── Left: Property image ── */}
        <div className="hidden lg:block relative overflow-hidden bg-muted h-full rounded-2xl m-3">

          {/* Round back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {propertyImage ? (
            <>
              <img
                src={propertyImage}
                alt="Property"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

              {/* bottom booking summary */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-50 mb-3">
                  Booking Summary
                </p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="opacity-60">Type</span>
                    <span className="font-semibold">{selectedType}</span>
                  </div>
                  {formatted ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="opacity-60">Date</span>
                        <span className="font-semibold">{formatted.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="opacity-60">Time</span>
                        <span className="font-semibold">{formatted.time}</span>
                      </div>
                    </>
                  ) : (
                    <p className="opacity-40 text-xs mt-1">
                      Select a date &amp; time to preview your booking.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Building2 className="w-10 h-10 opacity-20" />
              <p className="text-sm opacity-40">No property image</p>
            </div>
          )}
        </div>

        {/* ── Right: Form ── */}
        <div className="h-full overflow-y-auto flex flex-col bg-background">
          <div className="flex flex-col flex-1 justify-center px-10 lg:px-14 py-10 space-y-5 max-w-lg mx-auto w-full">

          {/* Title */}
          <div className="pb-2 border-b border-border">
            <h1 className="text-2xl font-bold tracking-tight">Book an Appointment</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in the details to schedule your visit.</p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Appointment Type
            </Label>
            <Select
              value={selectedType}
              onValueChange={(v) => setValue("type", v as AppointmentForm["type"])}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Property Viewing">Property Viewing</SelectItem>
                <SelectItem value="Inspection">Inspection</SelectItem>
                <SelectItem value="Legal Review">Legal Review</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("type")} />
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Date &amp; Time
            </Label>
            <Input
              type="datetime-local"
              {...register("date")}
              className={cn("h-11", errors.date && "border-destructive")}
            />
            {formatted && (
              <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-muted/60 border border-border/50 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  {formatted.date}
                </span>
                <span className="w-px h-3 bg-border shrink-0" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  {formatted.time}
                </span>
              </div>
            )}
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Title
            </Label>
            <Input
              {...register("title")}
              placeholder="e.g. Morning site visit"
              className={cn("h-11", errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Notes{" "}
              <span className="normal-case font-normal opacity-50">(optional)</span>
            </Label>
            <Textarea
              {...register("notes")}
              placeholder="Any requests or details for the agent..."
              rows={3}
              className="resize-none"
            />
          </div>

          <input type="hidden" {...register("propertyId")} />
          <input type="hidden" {...register("image")} />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 font-semibold"
            disabled={createAppointment.isPending}
          >
            {createAppointment.isPending ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
        </div>
      </div>
    </form>
  );
}
