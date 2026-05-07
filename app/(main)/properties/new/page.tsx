"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getSession } from "@/lib/client/auth-client";
import { useEffect, useState } from "react";
import AccessDeniedPage from "@/components/access-denied";
import Loading from "@/components/loading";
import PropertyForm from "../_components/property-form";
import { type PropertyFormValues } from "../_components/property-form";
import {
  useCreateProperty,
  PropertyForm as PropertyFormType,
} from "@/lib/client/queries/properties.queries";

export default function NewPropertyPage() {
  const router = useRouter();
  const create = useCreateProperty();
  // const [authorized, setAuthorized] = useState<boolean | null>(null);

  // useEffect(() => {
  //   getSession().then(({ data: session }) => {
  //     if (
  //       !session?.user ||
  //       !hasPermission(session.user.role as Role, Permission.MANAGE_PROPERTIES)
  //     ) {
  //       setAuthorized(false);
  //       router.replace(!session?.user ? "/login" : "/properties");
  //     } else {
  //       setAuthorized(true);
  //     }
  //   });
  // }, [router]);

  // if (authorized === null) return <Loading />;
  // if (authorized === false) return <AccessDeniedPage />;

  function handleSubmit(
    values: PropertyFormValues & {
      fileIds: string[];
      deletedFileIds: string[];
    },
  ) {
    const { deletedFileIds, ...payload } = values;
    create.mutate(payload as PropertyFormType & { fileIds: string[] }, {
      onSuccess: (data) => {
        toast.success("Property created successfully");
        router.push(`/properties/${data.property._id}`);
      },
      onError: (err: Error) => toast.error(err.message || "Failed to create property"),
    });
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Property</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details below to list a new property.
        </p>
      </div>
      <PropertyForm
        onSubmit={handleSubmit}
        isSubmitting={create.isPending}
        buttonText="Create Property"
      />
    </div>
  );
}
