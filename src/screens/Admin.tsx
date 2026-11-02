import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navigate } from "react-router-dom";
import {
  Users, Activity, Ban, Sparkles, Search, RefreshCw, X, MessageCircle,
  MessageSquare, Globe, ShieldCheck, Check, ChevronRight,
} from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricCard } from "../components/MetricCard";
import { Card } from "../components/Card";
import { useToast } from "../components/ToastProvider";
import { useAppStore } from "../store";

// ── Types ────────────────────────────────────────────────────────────
type Plan = "startup" | "starter" | "growth" | "managed";

interface ClientRow {
  id: string;
  email: string;
  plan: Plan;
  createdAt: string;
  suspended: boolean;
  suspendedReason: string | null;
  suspendedAt: string | null;
  replyLimitOverride: number | null;
  replyLimit: number | null;
  planReplyLimit: number | null;
  aiRepliesThisMonth: number;
  conversations30d: number;
  knowledgePassages: number;
  lastActiveAt: string | null;
  channels: { whatsapp: boolean; instagram: boolean; facebook: boolean; website: boolean };
  isSuperAdmin: boolean;
}

interface Overview {
  totalClients: number;
  activeClients30d: number;
  suspended: number;
  newThisMonth: number;
  aiRepliesThisMonth: number;
  month: string;
  byPlan: Record<string, number>;
}

interface AdminAction {
  id: string;
  adminEmail: string;
  targetEmail: string;
  action: "plan" | "limit" | "suspend" | "reactivate";
  details: any;
  createdAt: string;
}

// Must match PLAN_REPLY_LIMITS in server.js
const PLANS: { id: Plan; label: string; limit: number | null; note: string }[] = [
  { id: "startup", label: "No plan", limit: null, note: "Legacy accounts. No monthly cap." },
  { id: "starter", label: "Starter", limit: 1500, note: "$49 / month · 1,500 AI replies" },
  { id: "growth", label: "Growth", limit: 6000, note: "$149 / month · 6,000 AI replies" },
  { id: "managed", label: "Managed", limit: null, note: "$45 / month + $0.03 per reply · no cap" },
];
const planLabel = (p: string) => PLANS.find(x => x.id === p)?.label ?? p;

const apiUrl = () => (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

const timeAgo = (iso: string | null) => {
  if (!iso) return "Never";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const fmt = (n: number) => n.toLocaleString();

const btn = "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-[13px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
const btnPrimary = `${btn} bg-brand text-white hover:brightness-110`;
const btnSecondary = `${btn} bg-surface-high text-text-primary border border-border-faint hover:border-border-mid`;
const btnDanger = `${btn} bg-danger text-white hover:brightness-110`;

// ── Page ─────────────────────────────────────────────────────────────
export const Admin = () => {
  const { token, user } = useAppStore();
  const { toast } = useToast();

  const [overview, setOverview] = React.useState<Overview | null>(null);
  const [clients, setClients] = React.useState<ClientRow[]>([]);
  const [actions, setActions] = React.useState<AdminAction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "active" | "suspended" | "limit">("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const authed = React.useCallback(
    (path: string, init: RequestInit = {}) =>
      fetch(`${apiUrl()}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
      }),
    [token]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [o, u, a] = await Promise.all([
        authed("/api/admin/overview"),
        authed("/api/admin/users"),
        authed("/api/admin/actions?limit=20"),
      ]);
      if (!o.ok || !u.ok) throw new Error("Could not load admin data");
      setOverview(await o.json());
      setClients((await u.json()).users || []);
      if (a.ok) setActions((await a.json()).actions || []);
    } catch (err: any) {
      toast(err?.message || "Could not load admin data", "error");
    } finally {
      setLoading(false);
    }
  }, [authed, toast]);

  React.useEffect(() => { if (token && user?.isSuperAdmin) load(); }, [token, user?.isSuperAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only super admins ever see this page. The server enforces this too —
  // every /api/admin route returns 404 for anyone else.
  if (user && !user.isSuperAdmin) return <Navigate to="/dashboard" replace />;

  const atLimit = (c: ClientRow) => c.replyLimit != null && c.aiRepliesThisMonth >= c.replyLimit;
  const q = search.trim().toLowerCase();
  const visible = clients.filter(c => {
    if (q && !c.email.toLowerCase().includes(q)) return false;
    if (filter === "active") return !c.suspended;
    if (filter === "suspended") return c.suspended;
    if (filter === "limit") return atLimit(c);
    return true;
  });

  const selected = clients.find(c => c.id === selectedId) || null;

  const onSaved = (updated: ClientRow) => {
    setClients(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    // Refresh headline numbers and the activity log in the background.
    authed("/api/admin/overview").then(r => (r.ok ? r.json() : null)).then(d => d && setOverview(d)).catch(() => {});
    authed("/api/admin/actions?limit=20").then(r => (r.ok ? r.json() : null)).then(d => d && setActions(d.actions || [])).catch(() => {});
  };

  const filters: { id: typeof filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: clients.length },
    { id: "active", label: "Active", count: clients.filter(c => !c.suspended).length },
    { id: "suspended", label: "Suspended", count: clients.filter(c => c.suspended).length },
    { id: "limit", label: "At reply limit", count: clients.filter(atLimit).length },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <SectionHeader
        title="Super Admin"
        subtitle="Every client on CareAgent, their usage and their account status."
        actions={
          <button onClick={load} disabled={loading} className={btnSecondary}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Clients" value={overview ? fmt(overview.totalClients) : "—"}
          subtext={overview ? `${fmt(overview.newThisMonth)} joined this month` : undefined}
          icon={<Users size={16} />} loading={loading && !overview} />
        <MetricCard label="Active (30 days)" value={overview ? fmt(overview.activeClients30d) : "—"}
          subtext="Had at least one conversation" icon={<Activity size={16} />} loading={loading && !overview} />
        <MetricCard label="AI replies this month" value={overview ? fmt(overview.aiRepliesThisMonth) : "—"}
          subtext={overview ? `Across all clients · ${overview.month}` : undefined}
          icon={<Sparkles size={16} />} loading={loading && !overview} />
        <MetricCard label="Suspended" value={overview ? fmt(overview.suspended) : "—"}
          subtext="AI replies and login blocked" icon={<Ban size={16} />} loading={loading && !overview} />
      </div>

      {/* Plan mix */}
      {overview && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest mr-1">Plans</span>
          {PLANS.map(p => (
            <span key={p.id} className="text-[12px] font-semibold text-text-primary bg-surface border border-border-faint rounded-full px-3 py-1">
              {p.label} <span className="text-text-muted ml-1">{fmt(overview.byPlan[p.id] || 0)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Clients */}
      <Card variant="noPad">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-border-faint">
          <div className="flex flex-wrap gap-1.5">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                  filter === f.id ? "bg-brand/10 text-brand" : "text-text-muted hover:text-text-primary hover:bg-surface-high"
                }`}
              >
                {f.label} <span className="opacity-70 ml-0.5">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-bg border border-border-faint text-[13px] text-text-primary placeholder:text-text-disabled outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead>
              <tr className="text-[11px] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Channels</th>
                <th className="px-4 py-3 w-[200px]">AI replies this month</th>
                <th className="px-4 py-3">Conversations (30d)</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && clients.length === 0 &&
                [0, 1, 2, 3].map(i => (
                  <tr key={i} className="border-t border-border-faint">
                    <td colSpan={8} className="px-4 py-4"><div className="h-5 bg-surface-high rounded animate-pulse" /></td>
                  </tr>
                ))}

              {!loading && visible.length === 0 && (
                <tr className="border-t border-border-faint">
                  <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-text-muted">
                    {clients.length === 0 ? "No clients yet." : "No clients match this filter."}
                  </td>
                </tr>
              )}

              {visible.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="border-t border-border-faint hover:bg-surface-high/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-text-primary truncate max-w-[220px]">{c.email}</span>
                      {c.isSuperAdmin && <ShieldCheck size={13} className="text-brand flex-shrink-0" aria-label="Super admin" />}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5">Joined {fmtDate(c.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={c.plan} /></td>
                  <td className="px-4 py-3"><ChannelIcons channels={c.channels} /></td>
                  <td className="px-4 py-3"><UsageBar used={c.aiRepliesThisMonth} limit={c.replyLimit} /></td>
                  <td className="px-4 py-3 text-[13px] text-text-primary font-semibold">{fmt(c.conversations30d)}</td>
                  <td className="px-4 py-3 text-[12px] text-text-muted">{timeAgo(c.lastActiveAt)}</td>
                  <td className="px-4 py-3"><StatusBadge client={c} /></td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand">
                      Manage <ChevronRight size={13} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity */}
      <Card>
        <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Recent admin activity</div>
        {actions.length === 0 ? (
          <p className="text-[13px] text-text-muted">No changes yet. Every plan, limit and suspension change you make is recorded here.</p>
        ) : (
          <ul className="divide-y divide-border-faint">
            {actions.map(a => (
              <li key={a.id} className="py-2.5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
                <span className="text-[13px] text-text-primary">{describeAction(a)}</span>
                <span className="text-[11px] text-text-muted whitespace-nowrap">{timeAgo(a.createdAt)} · {a.adminEmail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AnimatePresence>
        {selected && (
          <ManageClientPanel
            key={selected.id}
            client={selected}
            onClose={() => setSelectedId(null)}
            onSaved={onSaved}
            authed={authed}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Small pieces ─────────────────────────────────────────────────────
const describeAction = (a: AdminAction) => {
  const who = <strong className="font-semibold">{a.targetEmail}</strong>;
  const lim = (v: number | null) => (v == null ? "plan default" : fmt(v));
  switch (a.action) {
    case "plan": return <>Changed {who} from {planLabel(a.details?.from)} to {planLabel(a.details?.to)}</>;
    case "limit": return <>Set {who} reply limit to {lim(a.details?.to)} (was {lim(a.details?.from)})</>;
    case "suspend": return <>Suspended {who}{a.details?.reason ? ` — ${a.details.reason}` : ""}</>;
    case "reactivate": return <>Reactivated {who}</>;
    default: return <>{a.action} {who}</>;
  }
};

const PlanBadge = ({ plan }: { plan: string }) => (
  <span className={`text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap ${
    plan === "startup" ? "bg-surface-high text-text-muted" : "bg-brand/10 text-brand"
  }`}>
    {planLabel(plan)}
  </span>
);

const StatusBadge = ({ client }: { client: ClientRow }) => {
  if (client.suspended) {
    return <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-danger-faint text-danger" title={client.suspendedReason || undefined}>Suspended</span>;
  }
  if (client.replyLimit != null && client.aiRepliesThisMonth >= client.replyLimit) {
    return <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-danger-faint text-danger">At limit</span>;
  }
  return <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-success-faint text-success">Active</span>;
};

// Drawn inline (instead of lucide's Instagram icon) because newer lucide
// releases removed brand icons.
const InstagramIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

const CHANNEL_META = [
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "facebook", label: "Messenger", Icon: MessageSquare },
  { key: "website", label: "Website chat", Icon: Globe },
] as const;

const ChannelIcons = ({ channels }: { channels: ClientRow["channels"] }) => (
  <div className="flex items-center gap-1.5">
    {CHANNEL_META.map(({ key, label, Icon }) => {
      const on = channels[key];
      return (
        <span
          key={key}
          title={`${label}: ${on ? "connected" : "not connected"}`}
          className={`w-7 h-7 rounded-md flex items-center justify-center ${on ? "bg-brand/10 text-brand" : "bg-surface-high text-text-disabled"}`}
        >
          <Icon size={14} />
        </span>
      );
    })}
  </div>
);

const UsageBar = ({ used, limit }: { used: number; limit: number | null }) => {
  if (limit == null) {
    return (
      <div>
        <div className="text-[13px] font-semibold text-text-primary">{fmt(used)}</div>
        <div className="text-[11px] text-text-muted">No monthly cap</div>
      </div>
    );
  }
  const pct = limit === 0 ? 100 : Math.min(100, Math.round((used / limit) * 100));
  const over = used >= limit;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="font-semibold text-text-primary">{fmt(used)} <span className="text-text-muted font-medium">/ {fmt(limit)}</span></span>
        <span className={over ? "text-danger font-bold" : "text-text-muted"}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-high mt-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${over ? "bg-danger" : "bg-brand"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ── Manage panel ─────────────────────────────────────────────────────
const ManageClientPanel = ({
  client, onClose, onSaved, authed,
}: {
  client: ClientRow;
  onClose: () => void;
  onSaved: (c: ClientRow) => void;
  authed: (path: string, init?: RequestInit) => Promise<Response>;
}) => {
  const { toast } = useToast();
  const [plan, setPlan] = React.useState<Plan>(client.plan);
  const [customLimit, setCustomLimit] = React.useState(client.replyLimitOverride != null);
  const [limitValue, setLimitValue] = React.useState(client.replyLimitOverride != null ? String(client.replyLimitOverride) : "");
  const [saving, setSaving] = React.useState(false);
  const [confirmSuspend, setConfirmSuspend] = React.useState(false);
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const planDefault = PLANS.find(p => p.id === plan)?.limit ?? null;
  const parsedLimit = limitValue.trim() === "" ? NaN : Number(limitValue);
  const limitInvalid = customLimit && (!Number.isInteger(parsedLimit) || parsedLimit < 0);
  const newOverride = customLimit ? parsedLimit : null;
  const planChanged = plan !== client.plan;
  const limitChanged = !limitInvalid && newOverride !== client.replyLimitOverride;

  const patch = async (body: Record<string, unknown>, success: string) => {
    setSaving(true);
    try {
      const res = await authed(`/api/admin/users/${client.id}`, { method: "PATCH", body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      onSaved(data.user);
      toast(success, "success");
      return true;
    } catch (err: any) {
      toast(err?.message || "Update failed", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const savePlan = async () => {
    const body: Record<string, unknown> = {};
    if (planChanged) body.plan = plan;
    if (limitChanged) body.replyLimitOverride = newOverride;
    await patch(body, "Plan and limit updated");
  };

  const toggleSuspension = async () => {
    if (client.suspended) {
      await patch({ suspended: false }, `${client.email} reactivated`);
    } else {
      const ok = await patch({ suspended: true, reason }, `${client.email} suspended`);
      if (ok) { setConfirmSuspend(false); setReason(""); }
    }
  };

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-label={`Manage ${client.email}`}
        className="relative w-full max-w-[460px] h-full bg-bg-elevated border-l border-border-faint shadow-2xl overflow-y-auto"
        initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-bg-elevated border-b border-border-faint px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-text-primary truncate">{client.email}</div>
            <div className="text-[12px] text-text-muted mt-0.5">Joined {fmtDate(client.createdAt)} · last active {timeAgo(client.lastActiveAt).toLowerCase()}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-high transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Snapshot */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="AI replies" value={fmt(client.aiRepliesThisMonth)} hint="this month" />
            <Stat label="Conversations" value={fmt(client.conversations30d)} hint="last 30 days" />
            <Stat label="KB passages" value={fmt(client.knowledgePassages)} hint="searchable" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Channels</div>
            <ChannelIcons channels={client.channels} />
          </div>

          {/* Plan & limit */}
          <section className="space-y-3">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Plan</div>
            <div className="grid grid-cols-2 gap-2">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`text-left rounded-xl border p-3 transition-all ${
                    plan === p.id ? "border-brand bg-brand/5 ring-1 ring-brand/30" : "border-border-faint hover:border-border-mid"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-text-primary">{p.label}</span>
                    {plan === p.id && <Check size={14} className="text-brand" />}
                  </div>
                  <div className="text-[11px] text-text-muted mt-1 leading-snug">{p.note}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Changing the plan here does not charge or refund the client in Paddle. Use it to fix a plan that did not sync, or to set up a Managed client.
            </p>

            <div className="rounded-xl border border-border-faint p-3 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={customLimit} onChange={e => setCustomLimit(e.target.checked)} className="accent-brand w-4 h-4" />
                <span className="text-[13px] font-semibold text-text-primary">Custom monthly AI reply limit</span>
              </label>
              {customLimit ? (
                <input
                  type="number" min={0} step={1} inputMode="numeric"
                  value={limitValue}
                  onChange={e => setLimitValue(e.target.value)}
                  placeholder="e.g. 3000"
                  className={`w-full h-9 px-3 rounded-lg bg-bg border text-[13px] text-text-primary outline-none transition-colors ${limitInvalid ? "border-danger" : "border-border-faint focus:border-brand"}`}
                />
              ) : (
                <p className="text-[12px] text-text-muted">
                  Using the plan default: {planDefault == null ? "no monthly cap" : `${fmt(planDefault)} replies`}.
                </p>
              )}
              {limitInvalid && <p className="text-[12px] text-danger">Enter a whole number of 0 or more.</p>}
            </div>

            <button onClick={savePlan} disabled={saving || limitInvalid || (!planChanged && !limitChanged)} className={`${btnPrimary} w-full`}>
              <Check size={14} /> Save plan and limit
            </button>
          </section>

          {/* Suspension */}
          <section className="space-y-3 pt-2 border-t border-border-faint">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest pt-4">Account status</div>

            {client.isSuperAdmin ? (
              <p className="text-[13px] text-text-muted">This is a super admin account and cannot be suspended here.</p>
            ) : client.suspended ? (
              <div className="rounded-xl border border-danger/30 bg-danger-faint p-4 space-y-3">
                <div className="text-[13px] font-semibold text-danger">Suspended {client.suspendedAt ? timeAgo(client.suspendedAt).toLowerCase() : ""}</div>
                {client.suspendedReason && <p className="text-[12px] text-text-second">Reason: {client.suspendedReason}</p>}
                <p className="text-[12px] text-text-second">They cannot log in and the AI does not reply to their customers. Incoming messages are still saved.</p>
                <button onClick={toggleSuspension} disabled={saving} className={`${btnSecondary} w-full`}>Reactivate account</button>
              </div>
            ) : (
              <AnimatePresence initial={false} mode="wait">
                {!confirmSuspend ? (
                  <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <p className="text-[12px] text-text-muted mb-3">Suspending blocks their login and stops all AI replies straight away. Nothing is deleted.</p>
                    <button onClick={() => setConfirmSuspend(true)} className={`${btn} w-full border border-danger/40 text-danger hover:bg-danger-faint`}>
                      <Ban size={14} /> Suspend account
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease }} className="overflow-hidden">
                    <div className="rounded-xl border border-danger/30 bg-danger-faint p-4 space-y-3">
                      <div className="text-[13px] font-semibold text-danger">Suspend {client.email}?</div>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        maxLength={500}
                        rows={2}
                        placeholder="Reason (optional, only admins see it)"
                        className="w-full px-3 py-2 rounded-lg bg-bg border border-border-faint text-[13px] text-text-primary placeholder:text-text-disabled outline-none focus:border-danger resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setConfirmSuspend(false); setReason(""); }} className={`${btnSecondary} flex-1`}>Cancel</button>
                        <button onClick={toggleSuspension} disabled={saving} className={`${btnDanger} flex-1`}>Suspend</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </section>
        </div>
      </motion.aside>
    </motion.div>
  );
};

const Stat = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="rounded-xl bg-surface border border-border-faint p-3">
    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</div>
    <div className="text-[20px] font-extrabold text-text-primary leading-tight mt-1">{value}</div>
    <div className="text-[10px] text-text-muted">{hint}</div>
  </div>
);
