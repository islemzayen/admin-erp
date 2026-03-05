"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EmployeeDashboard() {
  return (
    <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
      <DashboardLayout>
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        <p>Limited access view.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
