import { NextResponse } from "next/server";
import { requirePermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { Appointment } from "@/lib/models/Appointment";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/error";
import { Property } from "@/lib/models/Property";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  requirePermission(session.user.role as Role, Permission.MANAGE_APPOINTMENTS);

  const body = await req.json();
  const { propertyId } = body;

  if (!propertyId) return badRequest("Property ID is required");

  const property = await Property.findById(propertyId);
  if (!property) return notFound("Property not found");

  if (property.verificationStatus !== "verified") {
    return forbidden("Appointments can only be booked for verified properties");
  }

  const participants = [session.user.id, property.sellerId].filter(Boolean);

  const appointment = await Appointment.create({
    ...body,
    createdBy: session.user.id,
    participants,
    activityHistory: [
      {
        status: "scheduled",
        note: body.notes || "Appointment created",
        changedAt: new Date(),
      },
    ],
  });

  return NextResponse.json(appointment);
}
