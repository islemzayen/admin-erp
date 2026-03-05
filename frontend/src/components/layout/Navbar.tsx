"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, User, Settings, LogOut, HelpCircle, ChevronUp } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name.split(" ").map((p) => p[0]).join("").toUpperCase();
  };

  const roleName = user?.role.replace(/_/g, " ").toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

  return (
    <div className="flex justify-between items-center bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#2a2a2a] p-4 rounded-2xl relative transition-colors duration-300">

      {/* Left — ERP subtitle */}
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-mono mb-0.5">
          {t("erpSubtitle")}
        </p>
        <h1 className="text-sm font-semibold capitalize text-gray-900 dark:text-white tracking-wide font-mono">
          {user?.role.replace("_", " ").toLowerCase()}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#0d0d0d] flex items-center justify-center text-xs font-bold font-mono text-gray-600 dark:text-gray-400 hover:border-emerald-400/40 hover:text-emerald-400 transition-all duration-200"
        >
          {language === "en" ? "EN" : "FR"}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-100 dark:bg-[#0d0d0d] flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-all duration-200"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>

          {/* Trigger button */}
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl border transition-all duration-200 ${
              open
                ? "border-emerald-400/40 bg-gray-50 dark:bg-[#1f1f1f]"
                : "border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-white font-mono leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-400 font-mono leading-tight">{roleName}</p>
            </div>
            <ChevronUp
              size={12}
              className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-0" : "rotate-180"}`}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* User info header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
                  <div className="w-9 h-9 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-sm font-mono flex-shrink-0">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-mono leading-tight">{user?.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono leading-tight">{user?.email ?? roleName}</p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424] hover:text-gray-900 dark:hover:text-white transition-all duration-150"
                  >
                    <User size={14} className="text-gray-400" />
                    {t("profile")}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424] hover:text-gray-900 dark:hover:text-white transition-all duration-150"
                  >
                    <Settings size={14} className="text-gray-400" />
                    {t("settings")}
                  </Link>
                  <Link
                    href="/dashboard/support"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424] hover:text-gray-900 dark:hover:text-white transition-all duration-150"
                  >
                    <HelpCircle size={14} className="text-gray-400" />
                    Support
                  </Link>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
                  >
                    <LogOut size={14} />
                    {t("logout")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}