"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard, Users, Megaphone, ShoppingCart,
  Menu, Calendar, DollarSign, BarChart, FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const dashboardPath = `/dashboard/${user.role.toLowerCase().replace("_manager", "")}`;

  const linkClass =
    "flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-[#00ff9d] dark:hover:text-[#00ff9d] transition-colors duration-150 text-sm font-mono tracking-wide py-1";

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ duration: 0.2 }}
      className="m-4 p-4 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] shadow-xl flex-shrink-0 overflow-hidden transition-colors duration-300"
    >
      <div className="flex justify-between items-center mb-8">
        {!collapsed && (
          <span className="text-[#00ff9d] font-mono font-bold text-lg tracking-widest">ERP</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 dark:text-gray-500 hover:text-[#00ff9d] transition-colors ml-auto"
        >
          <Menu size={18} />
        </button>
      </div>

      <ul className="space-y-5">
        <li>
          <Link href={dashboardPath} className={linkClass}>
            <LayoutDashboard size={16} className="flex-shrink-0" />
            {!collapsed && t("dashboard")}
          </Link>
        </li>

        {user.role === "ADMIN" && (
          <>
            <li><Link href="/dashboard/admin/hr" className={linkClass}><Users size={16} className="flex-shrink-0" />{!collapsed && t("hr")}</Link></li>
            <li><Link href="/dashboard/admin/marketing" className={linkClass}><Megaphone size={16} className="flex-shrink-0" />{!collapsed && t("marketing")}</Link></li>
            <li><Link href="/dashboard/admin/sales" className={linkClass}><ShoppingCart size={16} className="flex-shrink-0" />{!collapsed && t("onlineSales")}</Link></li>
          </>
        )}

        {user.role === "HR_MANAGER" && (
          <>
            <li><Link href="/dashboard/hr/employees" className={linkClass}><Users size={16} className="flex-shrink-0" />{!collapsed && t("employees")}</Link></li>
            <li><Link href="/dashboard/hr/attendance" className={linkClass}><Calendar size={16} className="flex-shrink-0" />{!collapsed && t("attendance")}</Link></li>
            <li><Link href="/dashboard/hr/payroll" className={linkClass}><DollarSign size={16} className="flex-shrink-0" />{!collapsed && t("payroll")}</Link></li>
            <li><Link href="/dashboard/hr/performance" className={linkClass}><BarChart size={16} className="flex-shrink-0" />{!collapsed && t("performance")}</Link></li>
            <li><Link href="/dashboard/hr/reports" className={linkClass}><FileText size={16} className="flex-shrink-0" />{!collapsed && t("reports")}</Link></li>
          </>
        )}

        {user.role === "SALES_MANAGER" && (
          <>
            <li><Link href="/dashboard/sales/catalog" className={linkClass}><ShoppingCart size={16} className="flex-shrink-0" />{!collapsed && t("productCatalog")}</Link></li>
            <li><Link href="/dashboard/sales/orders" className={linkClass}><FileText size={16} className="flex-shrink-0" />{!collapsed && t("onlineOrders")}</Link></li>
            <li><Link href="/dashboard/sales/stock" className={linkClass}><BarChart size={16} className="flex-shrink-0" />{!collapsed && t("stockProduction")}</Link></li>
            <li><Link href="/dashboard/sales/tracking" className={linkClass}><Calendar size={16} className="flex-shrink-0" />{!collapsed && t("deliveryTracking")}</Link></li>
            <li><Link href="/dashboard/sales/returns" className={linkClass}><DollarSign size={16} className="flex-shrink-0" />{!collapsed && t("returnsRefunds")}</Link></li>
          </>
        )}

        {user.role === "MARKETING_MANAGER" && (
          <>
            <li><Link href="/dashboard/marketing/campaigns" className={linkClass}><Megaphone size={16} className="flex-shrink-0" />{!collapsed && t("campaigns")}</Link></li>
            <li><Link href="/dashboard/marketing/analytics" className={linkClass}><BarChart size={16} className="flex-shrink-0" />{!collapsed && t("analytics")}</Link></li>
            <li><Link href="/dashboard/marketing/segmentation" className={linkClass}><Users size={16} className="flex-shrink-0" />{!collapsed && t("segmentation")}</Link></li>
            <li><Link href="/dashboard/marketing/budget" className={linkClass}><DollarSign size={16} className="flex-shrink-0" />{!collapsed && t("budget")}</Link></li>
            <li><Link href="/dashboard/marketing/promotions" className={linkClass}><Calendar size={16} className="flex-shrink-0" />{!collapsed && t("promotions")}</Link></li>
          </>
        )}
      </ul>
    </motion.div>
  );
}