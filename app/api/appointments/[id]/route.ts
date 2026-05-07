import { NextResponse } from "next/server";
import { Permission, requirePermission, Role } from "@/lib/rbac";
import mongoose, { Types } from "mongoose";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/error";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";
import { connectToDatabase } from "@/lib/server/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

  // const appointment = await Appointment.collection.findById(id).lean();
  // return NextResponse.json(appointment)
  const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!appointment) return notFound();

  const userId = session?.user.id.toString();
  const isParticipant = (appointment.participants as any[])
    .filter(Boolean)
    .some((_id: any) => _id.toString() === userId);

  if (!isParticipant && session.user.role !== Role.ADMIN) return forbidden();

  return NextResponse.json(appointment);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session?.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  const body = await req.json();

  const appointment = await Appointment.findById(id);
  if (!appointment) return notFound();

  if (
    appointment.createdBy.toString() !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return forbidden();
  }

  const updated = await Appointment.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  const { status, notes } = await req.json();

  const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!appointment) return notFound();

  const history: any[] = appointment.activityHistory ?? [];
  const currentStatus = history[history.length - 1]?.status;

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return forbidden("Cannot modify a completed or cancelled appointment");
  }

  if (session.user.role === Role.BUYER && status === "completed") {
    return forbidden("Buyer cannot mark appointment as completed");
  }

  const userId = session.user.id;
  const isParticipant = (appointment.participants as any[])
    .filter(Boolean)
    .some((pid: any) => pid.toString() === userId);

  if (!isParticipant && session.user.role !== Role.ADMIN) return forbidden();

  await connectToDatabase();
  const mongoSession = await mongoose.startSession();

  let updated;
  try {
    await mongoSession.withTransaction(async () => {
      updated = await Appointment.collection.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          $push: {
            activityHistory: {
              status,
              note: notes || "",
              changedAt: new Date(),
            },
          },
        },
        { returnDocument: "after", session: mongoSession },
      );
    });
  } finally {
    await mongoSession.endSession();
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const { id } = await params;
  const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) });
  if (!appointment) return notFound();

  const history: any[] = (appointment as any).activityHistory ?? [];
  const currentStatus = history[history.length - 1]?.status;
  if (currentStatus === "completed") {
    return forbidden("Cannot delete a completed appointment");
  }

  if (
    appointment.createdBy.toString() !== session.user.id &&
    session.user.role !== Role.ADMIN
  ) {
    return forbidden();
  }

  await Appointment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
