import { Suspense } from "react";
import Loading from "@/components/loading";
import NewAppointmentForm from "../_components/appointment-form";

export default function NewAppointmentPage() {
  return (
    <div className="h-full overflow-hidden p-6">
      <div className="h-full rounded-2xl overflow-hidden border border-border shadow-sm">
        <Suspense fallback={<Loading />}>
          <NewAppointmentForm />
        </Suspense>
      </div>
    </div>
  );
}
