export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "available" | "sold" | "pending";
}

export interface Favorite {
  _id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "approved";

export interface ActivityEntry {
  status: AppointmentStatus;
  note: string;
  changedAt: string;
}

export interface Appointment {
  _id: string;
  title: string;
  type: "Property Viewing" | "Inspection" | "Legal Review";
  date: string;
  propertyId?: string;
  participants: string[];
  createdBy: string;
  createdAt: string;
  image?: string;
  activityHistory: ActivityEntry[];
}

export interface AppointmentForm {
  title: string;
  type: "Property Viewing" | "Inspection" | "Legal Review";
  date: string;
  notes?: string;
  propertyId: string;
  image?: string;
}

