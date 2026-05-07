"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import Loading from "@/components/loading";
import {
  useAppointment,
  useDeleteAppointment,
  useUpdateAppointmentStatus,
} from "@/lib/client/queries/appointments.queries";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { usePropertyImages } from "@/lib/client/queries/properties.queries";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const StatusBadge = ({ status }: { status: string }) => {
  const variantMap: Record<string, BadgeVariant> = {
    scheduled: "default",
    approved: "success",
    completed: "secondary",
    cancelled: "destructive",
  };

  return (
    <Badge
      variant={variantMap[status] || "outline"}
      className="capitalize px-3 py-1"
    >
      {status}
    </Badge>
  );
};

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: appointment, isLoading: loadingAppointment } =
    useAppointment(id);
  const { data: images = [] } = usePropertyImages(appointment?.propertyId);

  const del = useDeleteAppointment();
  const updateStatus = useUpdateAppointmentStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState<
    "approved" | "cancelled" | null
  >(null);
  const [note, setNote] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  if (loadingAppointment) return <Loading message="Fetching data..." />;
  if (!appointment)
    return <p className="text-center py-20">Appointment not found</p>;

  const firstImage = images.length > 0 ? images[0].url : null;
  const history = appointment.activityHistory ?? [];
  const currentStatus = (history[history.length - 1]?.status ?? "scheduled") as string;
  const isScheduled = currentStatus === "scheduled";
  const isApproved = currentStatus === "approved";
  const isCancelled = currentStatus === "cancelled";
  const isCompleted = currentStatus === "completed";

  const handleDelete = () => {
    del.mutate(id, {
      onSuccess: () => {
        toast.success("Appointment deleted successfully!");
        router.push("/dashboard");
      },
      onError: (err: any) =>
        toast.error(err?.message || "Failed to delete appointment"),
    });
  };

  const timeline = [
    {
      date: appointment.createdAt,
      label: "Created",
      note: "Initial request sent.",
    },
    ...(appointment.activityHistory ?? []).map((entry) => ({
      date: entry.changedAt,
      label: entry.status.charAt(0).toUpperCase() + entry.status.slice(1),
      note: entry.note || `Status changed to ${entry.status}`,
    })),
  ];

  const handleOpenDialog = (status: "approved" | "cancelled") => {
    setStatusToUpdate(status);
    setDialogOpen(true);
  };

  const handleSubmitStatus = () => {
    if (!statusToUpdate) return;
    updateStatus.mutate(
      { id, status: statusToUpdate, notes: note },
      {
        onSuccess: () => {
          toast.success(`Appointment ${statusToUpdate} successfully!`);
          setDialogOpen(false);
          setNote("");
          router.push(`/appointments/${id}`);
        },
        onError: (err: any) => toast.error(err?.message || "Failed"),
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
            <div className="relative h-72 w-full bg-muted">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt="Property"
                  fill
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="absolute top-4 right-4">
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {appointment.title}
                    </h1>
                    {appointment.propertyId && (
                      <Link
                        href={`/properties/${appointment.propertyId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Property
                      </Link>
                    )}
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(appointment.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {isScheduled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAlertOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                {!isCompleted && !isCancelled && (
                  <>
                    {isScheduled && (
                      <>
                        <Button onClick={() => handleOpenDialog("approved")}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenDialog("cancelled")}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          <X /> Cancel
                        </Button>
                      </>
                    )}
                    {isApproved && (
                      <Button
                        className="w-full"
                        onClick={() =>
                          updateStatus.mutate(
                            { id, status: "completed", notes: "" },
                            {
                              onSuccess: () =>
                                toast.success("Appointment completed!"),
                              onError: (err: any) =>
                                toast.error(err?.message || "Failed to complete appointment"),
                            },
                          )
                        }
                      >
                        Complete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Activity History
          </h3>

          <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {timeline &&
              timeline.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-background bg-primary" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {item && item?.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(item! && item?.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                      {item && item?.note}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
            <p className="text-sm text-muted-foreground">
              This action is permanent.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Back
            </Button>
            <Button
              onClick={handleSubmitStatus}
              variant={
                statusToUpdate === "approved" ? "default" : "destructive"
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
