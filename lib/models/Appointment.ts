import { Schema, model, models, Types } from "mongoose";

export interface IActivityEntry {
  status: string;
  note: string;
  changedAt: Date;
}

export interface IAppointment {
  title: string;
  type: "Property Viewing" | "Inspection" | "Legal Review";
  date: Date;
  propertyId?: Types.ObjectId;
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  image?: string;
  activityHistory: IActivityEntry[];
}

const ActivityEntrySchema = new Schema<IActivityEntry>(
  {
    status: { type: String, required: true },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AppointmentSchema = new Schema<IAppointment>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  type: {
    type: String,
    required: true,
    enum: ["Property Viewing", "Inspection", "Legal Review"],
  },
  date: { type: Date, required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null },
  participants: [
    { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
  ],
  createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, default: null },
  activityHistory: { type: [ActivityEntrySchema], default: [] },
});

export const Appointment =
  models.Appointment || model<IAppointment>("Appointment", AppointmentSchema);
