"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-[#0d0d0d] transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 p-6">
        <Navbar />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}