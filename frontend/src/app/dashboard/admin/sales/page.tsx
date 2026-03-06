"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Plus, Download,
  TrendingUp, Pencil, Trash2, X, Loader2, KeyRound,
} from "lucide-react";
import { useState, useEffect } from "react";
import { salesService } from "@/services/salesService";
import { adminService } from "@/services/adminService";
import CalendarPicker from "@/components/CalendarPicker";

interface Employee {
  _id: string; name: string; position: string;
  phone: string; email: string; salary: number; joinedDate: string;
}
interface FormState {
  name: string; position: string; phone: string;
  email: string; salary: string; joinedDate: string;
}
interface Credentials { email: string; password: string; }

const AVATAR_COLORS = [
  "bg-emerald-500/20 text-emerald-400","bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400","bg-amber-500/20 text-amber-400",
  "bg-pink-500/20 text-pink-400","bg-teal-500/20 text-teal-400",
  "bg-red-500/20 text-red-400","bg-indigo-500/20 text-indigo-400",
];
const POSITIONS = ["Employee", "Sales Manager"];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function OnlineSalesEmployees() {
  const { t } = useLanguage();
  const [search, setSearch]       = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState({ total: 0, active: 0, onLeave: 0, avgTenure: 0 });

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset]   = useState(false);

  const [selected, setSelected]     = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<Credentials | null>(null);

  const [resetPassword, setResetPassword] = useState("");
  const [resetResult, setResetResult]     = useState<string | null>(null);
  const [resetLoading, setResetLoading]   = useState(false);

  const emptyForm: FormState = { name:"", position:"", phone:"", email:"", salary:"", joinedDate: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState<FormState>(emptyForm);

  const card       = "bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-white/[0.06] rounded-2xl transition-colors duration-300";
  const inputClass = "w-full px-3 py-2 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/60 transition";
  const labelClass = "text-xs text-gray-500 uppercase tracking-widest mb-1 block";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [emps, st] = await Promise.all([salesService.getAllEmployees(), salesService.getStats()]);
      setEmployees(emps); setStats(st);
    } catch {} finally { setLoading(false); }
  };

  const handleExport = () => {
    if (!employees.length) return;
    const headers = ["Name","Position","Email","Phone","Salary (TND)","Joined Date"];
    const rows = employees.map(e => [e.name, e.position, e.email||"", e.phone||"", e.salary??"",
      e.joinedDate ? new Date(e.joinedDate).toLocaleDateString("en-GB") : ""]);
    const csv = [headers,...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href=url; a.download=`sales-employees-${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const handleCreate = async () => {
    if (!form.name || !form.position) { setFormError("Name and position are required"); return; }
    if (form.phone && form.phone.replace(/\s/g,"").length !== 8) { setFormError("Phone number must be 8 digits"); return; }
    try {
      setSubmitting(true); setFormError("");
      const result = await salesService.createEmployee({ ...form, salary: Number(form.salary)||0 });
      await fetchAll(); setShowCreate(false); setForm(emptyForm);
      setCreatedCredentials({ email: result.email, password: result.plainPassword });
    } catch (err: any) { setFormError(err.response?.data?.message || "Failed to create employee"); }
    finally { setSubmitting(false); }
  };

  const openEdit = (emp: Employee) => {
    setSelected(emp);
    setForm({ name: emp.name, position: emp.position, phone: emp.phone||"", email: emp.email||"",
      salary: emp.salary ? String(emp.salary) : "",
      joinedDate: emp.joinedDate ? new Date(emp.joinedDate).toISOString().split("T")[0] : "" });
    setFormError(""); setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!form.name || !form.position) { setFormError("Name and position are required"); return; }
    if (form.phone && form.phone.replace(/\s/g,"").length !== 8) { setFormError("Phone number must be 8 digits"); return; }
    try {
      setSubmitting(true); setFormError("");
      await salesService.updateEmployee(selected!._id, { ...form, salary: Number(form.salary)||0 });
      await fetchAll(); setShowEdit(false);
    } catch (err: any) { setFormError(err.response?.data?.message || "Failed to update employee"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try { setSubmitting(true); await salesService.deleteEmployee(selected!._id); await fetchAll(); setShowDelete(false); }
    catch {} finally { setSubmitting(false); }
  };

  const openReset = (emp: Employee) => { setSelected(emp); setResetPassword(""); setResetResult(null); setShowReset(true); };

  const handleResetPassword = async () => {
    if (!selected || resetPassword.length < 6) return;
    setResetLoading(true);
    try { const res = await adminService.resetPassword(selected._id, resetPassword); setResetResult(res.tempPassword); }
    catch { setResetResult(null); }
    finally { setResetLoading(false); }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { month:"short", year:"numeric" }) : "—";
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase()) ||
    (e.email||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
    <DashboardLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-[#060a0f] text-gray-900 dark:text-white font-mono p-6 space-y-6 transition-colors duration-300">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight leading-none">{t("onlineSales")} <span className="text-emerald-400">{t("employees")}</span></h1>
            <p className="text-xs text-gray-500 mt-1.5 uppercase tracking-widest">{t("onlineSalesSubtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} disabled={!employees.length}
              className="flex items-center gap-2 border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 px-4 py-2 rounded-xl text-xs uppercase tracking-wide transition text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed">
              <Download size={13} /> {t("export")}
            </button>
            <button onClick={() => { setForm(emptyForm); setFormError(""); setShowCreate(true); }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs uppercase tracking-wide transition text-black font-bold">
              <Plus size={13} /> {t("addEmployee")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: t("totalEmployeesKpiShort"), value: String(stats.total), sub: t("inDepartment"), icon: <Users size={14} />, iconBg: "bg-blue-500/10 text-blue-400" },
            { label: t("avgTenure"), value: `${stats.avgTenure}yr`, sub: t("avgPerEmployee"), icon: <TrendingUp size={14} />, iconBg: "bg-purple-500/10 text-purple-400" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`${card} px-5 py-4 flex items-center gap-4`}>
              <div className={`p-2 rounded-xl ${s.iconBg}`}>{s.icon}</div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-gray-200 dark:border-white/[0.05]">
            <div>
              <h2 className="text-base font-bold">Online Sales Team</h2>
              <p className="text-xs text-gray-500">{filtered.length} {t("ofText")} {employees.length} {t("records")}</p>
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:border-emerald-500/40 transition text-gray-900 dark:text-white placeholder-gray-400"
                placeholder={t("searchEmployee")} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="grid px-6 py-3 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-600 border-b border-gray-100 dark:border-white/[0.04]"
            style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 100px" }}>
            <span>{t("employee")}</span><span>{t("position")}</span><span>{t("phone")}</span><span>{t("joined")}</span><span>Actions</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">{t("noEmployeesMatch")}</div>
          ) : (
            filtered.map((emp, i) => (
              <motion.div key={emp._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className={`grid px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition ${i < filtered.length - 1 ? "border-b border-gray-100 dark:border-white/[0.03]" : ""}`}
                style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 100px" }}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {emp.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{emp.name}</p>
                    <p className="text-[10px] text-gray-400">{emp.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{emp.position}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{emp.phone || "—"}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(emp.joinedDate)}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(emp)} title="Edit" className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition"><Pencil size={13} /></button>
                  <button onClick={() => openReset(emp)} title="Reset Password" className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition"><KeyRound size={13} /></button>
                  <button onClick={() => { setSelected(emp); setShowDelete(true); }} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"><Trash2 size={13} /></button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <Modal title="Add Employee" onClose={() => setShowCreate(false)}>
            <div className="space-y-4">
              <div><label className={labelClass}>Full Name</label>
                <input className={inputClass} placeholder="Jane Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className={labelClass}>Position</label>
                <select className={inputClass} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                  <option value="">— Select Position —</option>{POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Phone</label>
                  <input className={inputClass} placeholder="12345678" maxLength={8} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,"") }))} /></div>
                <div><label className={labelClass}>Salary (TND)</label>
                  <input className={inputClass} type="text" inputMode="numeric" placeholder="0" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value.replace(/\D/g,"") }))} /></div>
              </div>
              <CalendarPicker value={form.joinedDate} onChange={(date) => setForm(f => ({ ...f, joinedDate: date }))} inputClass={inputClass} labelClass={labelClass} />
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Cancel</button>
                <button onClick={handleCreate} disabled={submitting} className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add Employee
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showEdit && selected && (
          <Modal title="Edit Employee" onClose={() => setShowEdit(false)}>
            <div className="space-y-4">
              <div><label className={labelClass}>Full Name</label>
                <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className={labelClass}>Position</label>
                <select className={inputClass} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                  <option value="">— Select Position —</option>{POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Phone</label>
                  <input className={inputClass} maxLength={8} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g,"") }))} /></div>
                <div><label className={labelClass}>Salary (TND)</label>
                  <input className={inputClass} type="text" inputMode="numeric" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value.replace(/\D/g,"") }))} /></div>
              </div>
              <div><label className={labelClass}>Email</label>
                <input className={inputClass} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <CalendarPicker value={form.joinedDate} onChange={(date) => setForm(f => ({ ...f, joinedDate: date }))} inputClass={inputClass} labelClass={labelClass} />
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Cancel</button>
                <button onClick={handleEdit} disabled={submitting} className="flex-1 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Pencil size={13} />} Save Changes
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showDelete && selected && (
          <Modal title="Delete Employee" onClose={() => setShowDelete(false)}>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Are you sure you want to delete <span className="text-white font-bold">{selected.name}</span>? This cannot be undone.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Cancel</button>
                <button onClick={handleDelete} disabled={submitting} className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showReset && selected && (
          <Modal title="Reset Password" onClose={() => { setShowReset(false); setResetResult(null); }}>
            {resetResult ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Password reset for <span className="text-white font-semibold">{selected.name}</span>. Share this — shown only once.</p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-4 text-center space-y-1">
                  <p className="text-[10px] text-yellow-400 uppercase tracking-widest">New Password</p>
                  <p className="text-2xl font-mono font-bold text-yellow-300">{resetResult}</p>
                </div>
                <button onClick={() => { setShowReset(false); setResetResult(null); }}
                  className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition">Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Set a new password for <span className="text-white font-semibold">{selected.name}</span>.</p>
                <div><label className={labelClass}>New Password</label>
                  <input type="text" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Min. 6 characters" className={inputClass} /></div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowReset(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Cancel</button>
                  <button onClick={handleResetPassword} disabled={resetLoading || resetPassword.length < 6}
                    className="flex-1 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/30 transition disabled:opacity-40 flex items-center justify-center gap-2">
                    {resetLoading ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />} Reset Password
                  </button>
                </div>
              </div>
            )}
          </Modal>
        )}

        {createdCredentials && (
          <Modal title="Account Created" onClose={() => setCreatedCredentials(null)}>
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Share these credentials. This password will not be shown again.</p>
              <div className="space-y-3">
                <div><label className={labelClass}>Email</label>
                  <div className="flex items-center gap-2">
                    <input readOnly className={inputClass} value={createdCredentials.email} />
                    <button onClick={() => navigator.clipboard.writeText(createdCredentials.email)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap">Copy</button>
                  </div></div>
                <div><label className={labelClass}>Password</label>
                  <div className="flex items-center gap-2">
                    <input readOnly className={inputClass} value={createdCredentials.password} />
                    <button onClick={() => navigator.clipboard.writeText(createdCredentials.password)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap">Copy</button>
                  </div></div>
              </div>
              <div className="pt-2">
                <button onClick={() => setCreatedCredentials(null)} className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition">Done</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </DashboardLayout>
    </ProtectedRoute>
  );
}