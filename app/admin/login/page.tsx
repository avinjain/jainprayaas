import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center text-slate-600">
          Loading…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
