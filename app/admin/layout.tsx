import type { ReactNode } from "react";
import { AdminBar } from "@/components/AdminBar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminBar />
      <div className="min-h-full bg-slate-50">{children}</div>
    </>
  );
}
