"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleRequired="lecturer">
      {children}
    </DashboardLayout>
  );
}
