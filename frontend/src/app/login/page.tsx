"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });

      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      });

      

      const roleRoutes: Record<string, string> = {
        ADMIN: "/dashboard/admin",
        HR_MANAGER: "/dashboard/hr",
        MARKETING_MANAGER: "/dashboard/marketing",
        SALES_MANAGER: "/dashboard/sales",
        EMPLOYEE: "/dashboard/employee",
      };

      router.push(roleRoutes[data.user.role] || "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-[#0d0d0d] text-gray-900 dark:text-white transition-colors duration-300">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 items-center justify-center border-r border-gray-200 dark:border-[#2a2a2a] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#00ff9d 1px, transparent 1px), linear-gradient(90deg, #00ff9d 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute w-72 h-72 rounded-full bg-[#00ff9d]/5 blur-3xl" />
        <div className="relative text-center px-16 z-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-mono mb-4">
            {t("erpSubtitle")}
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white font-mono mb-6">
            ERP<span className="text-[#00ff9d]">.</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono leading-relaxed max-w-xs mx-auto">
            {t("erpTagline")}
          </p>
          <div className="mt-12 flex flex-col gap-3 items-center">
            {[
              { label: t("statRevenue"), value: "$218,400" },
              { label: t("statOrders"), value: "1,646" },
              { label: t("statUptime"), value: "99.98%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between w-56 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 transition-colors duration-300"
              >
                <span className="text-[11px] font-mono tracking-widest uppercase text-gray-500">
                  {stat.label}
                </span>
                <span className="text-[#00ff9d] font-mono text-sm font-bold">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-mono mb-3">
              {t("authLabel")}
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {t("signInTitle")}
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-gray-500 mb-2">
                {t("emailLabel")}
              </label>
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="w-full bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] focus:border-[#00ff9d]/50 focus:outline-none p-3 rounded-lg transition-colors text-gray-900 dark:text-white font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono tracking-[0.2em] uppercase text-gray-500 mb-2">
                {t("passwordLabel")}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] focus:border-[#00ff9d]/50 focus:outline-none p-3 rounded-lg transition-colors text-gray-900 dark:text-white font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono tracking-wide">
                ✗ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[#00c97a] dark:text-[#00ff9d] font-mono text-sm tracking-widest uppercase hover:bg-[#00ff9d]/20 hover:border-[#00ff9d]/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SIGNING IN..." : t("signInButton")}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-10 font-mono text-center tracking-widest">
            {t("copyright")}
          </p>
        </div>
      </div>
    </div>
  );
}