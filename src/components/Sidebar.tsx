import { cn } from "@/src/lib/utils";
import { 
  LayoutDashboard, Inbox, Sparkles, AlertTriangle,
  Database, Rocket, Plug, ChartBar, LogOut, ChevronRight, CreditCard
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { useNavigate, useLocation } from "react-router-dom";
import * as React from "react";
import { useAppStore } from "../store";
import { motion, AnimatePresence } from "motion/react";

export type SectionType = "Operations" | "Admin" | "Analytics";

const navItems = {
  Operations: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "inbox", label: "Inbox", icon: Inbox, path: "/inbox" },
    { id: "escalations", label: "Escalations", icon: AlertTriangle, path: "/escalations" },
  ],
  Admin: [
    { id: "onboarding", label: "Quick Setup", icon: Rocket, path: "/onboarding" },
    { id: "kb", label: "Knowledge Base", icon: Database, path: "/knowledge-base" },
    { id: "channels", label: "Channels", icon: Plug, path: "/channels" },
    { id: "billing", label: "Billing", icon: CreditCard, path: "/billing" },
  ],
  Analytics: [
    { id: "insights", label: "Analytics", icon: ChartBar, path: "/analytics" },
  ]
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setToken, tickets, aiDrafts, markSectionSeen } = useAppStore();

  const escalatedCount = tickets.filter(
    t => t.status === "escalated" || (aiDrafts && aiDrafts[t.id]?.status === "escalated")
  ).length;

  const getBadge = (id: string) => {
    if (id === "inbox") {
      const lastSeen = user?.lastSeenInboxAt ? new Date(user.lastSeenInboxAt) : null;
      const newCount = lastSeen
        ? tickets.filter(t => t.status !== "escalated" && new Date(t.createdAt) > lastSeen).length
        : tickets.filter(t => t.status !== "escalated").length;
      return newCount > 0 ? String(newCount) : null;
    }
    if (id === "escalations") {
      const lastSeen = user?.lastSeenEscalAt ? new Date(user.lastSeenEscalAt) : null;
      const newCount = lastSeen ? 0 : escalatedCount;
      return newCount > 0 ? String(newCount) : null;
    }
    return null;
  };

  const handleNavClick = (path: string, id: string) => {
    if (id === "inbox" || id === "escalations") markSectionSeen(id as any);
    navigate(path);
  };

  const handleLogout = () => { setToken(null); navigate("/"); };

  return (
    <aside className="w-[220px] h-full bg-bg-elevated border-r border-border-faint flex flex-col z-20 select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-faint">
        <button onClick={() => navigate("/")} className="flex items-center gap-3 group w-full text-left">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dim flex items-center justify-center shadow-glow flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles size={15} className="text-white fill-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-black text-text-primary tracking-tight leading-none">CareAgent</div>
            <div className="text-[9px] font-mono text-brand/60 mt-0.5">v1.2.0 · beta</div>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {(Object.keys(navItems) as SectionType[]).map((section) => (
          <div key={section}>
            <div className="px-2 mb-2 text-[10px] font-black text-text-disabled uppercase tracking-[0.15em]">
              {section}
            </div>
            <div className="space-y-0.5">
              {navItems[section as keyof typeof navItems].map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const badge = getBadge(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path, item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group relative text-left",
                      isActive
                        ? "bg-brand text-white shadow-glow/30"
                        : "text-text-muted hover:bg-surface-high hover:text-text-primary"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={cn("flex-shrink-0", isActive ? "text-white" : "text-text-muted group-hover:text-text-primary")} />
                      <span className={cn("text-[13px] font-semibold", isActive ? "text-white" : "")}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {badge && (
                        <span className={cn(
                          "text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                          isActive ? "bg-white/20 text-white" : "bg-brand/15 text-brand"
                        )}>{badge}</span>
                      )}
                      {isActive && <ChevronRight size={12} className="text-white/60" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border-faint">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-high transition-colors group cursor-pointer" onClick={handleLogout} title="Sign out">
          <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-black text-brand">
              {user?.email ? user.email.substring(0, 2).toUpperCase() : "AG"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-text-primary truncate leading-none">
              {user?.email ? user.email.split("@")[0] : "Agent"}
            </div>
            <div className="text-[10px] text-text-muted truncate mt-0.5">{user?.email || "Support Agent"}</div>
          </div>
          <LogOut size={13} className="text-text-disabled group-hover:text-danger flex-shrink-0 transition-colors" />
        </div>
      </div>
    </aside>
  );
};
