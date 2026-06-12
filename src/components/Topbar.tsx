import * as React from "react";
import { Search, Bell, HelpCircle, Command } from "lucide-react";
import { Dot } from "./ui/AtomsMisc";
import { IconButton } from "./ui/IconButton";
import { useAppStore } from "../store";
import { useNavigate } from "react-router-dom";

export const Topbar = () => {
  const { tickets, aiDrafts } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const escalated = tickets.filter(t => t.status === "escalated" || aiDrafts[t.id]?.status === "escalated").length;

  // Simple search — filter tickets by subject/customer
  const results = query.trim().length > 1
    ? tickets.filter(t =>
        t.subject?.toLowerCase().includes(query.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="h-[52px] w-full bg-bg-elevated border-b border-border-faint flex items-center justify-between px-5 z-30 gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={13} />
        <input
          type="text"
          placeholder="Search tickets..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="w-full bg-surface border border-border-faint rounded-xl h-8 pl-8 pr-10 text-[12px] text-text-primary placeholder:text-text-disabled outline-none focus:border-brand/40 focus:bg-bg transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
          <Command size={9} className="text-text-disabled" />
          <span className="text-[9px] font-bold text-text-disabled">K</span>
        </div>

        {/* Search dropdown */}
        {focused && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated border border-border-faint rounded-xl shadow-xl overflow-hidden z-50">
            {results.map(t => (
              <button
                key={t.id}
                onClick={() => { navigate(`/inbox?ticket=${t.id}`); setQuery(""); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-black text-brand">{(t.initials || "?").substring(0,2)}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-text-primary truncate">{t.customerName}</div>
                  <div className="text-[10px] text-text-muted truncate">{t.subject}</div>
                </div>
                {t.status === "escalated" && (
                  <span className="text-[9px] font-black text-danger bg-danger/10 px-1.5 py-0.5 rounded-full flex-shrink-0">ESC</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* AI Status */}
        <div className="flex items-center gap-1.5 bg-success/8 border border-success/15 rounded-full px-3 py-1.5">
          <Dot pulse color="bg-success" />
          <span className="text-[10px] font-black text-success uppercase tracking-wider">AI Active</span>
        </div>

        {/* Escalation alert */}
        {escalated > 0 && (
          <button
            onClick={() => navigate("/escalations")}
            className="flex items-center gap-1.5 bg-danger/8 border border-danger/15 rounded-full px-3 py-1.5 hover:bg-danger/15 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            <span className="text-[10px] font-black text-danger uppercase tracking-wider">{escalated} escalated</span>
          </button>
        )}

        <div className="flex items-center gap-0.5 border-l border-border-faint pl-3">
          <IconButton><Bell size={15} /></IconButton>
          <IconButton><HelpCircle size={15} /></IconButton>
        </div>
      </div>
    </header>
  );
};
