import { cn } from "@/src/lib/utils";
import { 
  LayoutDashboard, 
  Inbox, 
  Sparkles, 
  AlertTriangle, 
  Database, 
  Rocket, 
  Plug, 
  ChartBar, 
  Settings,
  MoreVertical
} from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { IconButton } from "./ui/IconButton";
import { useNavigate, useLocation } from "react-router-dom";
import * as React from "react";
import { useAppStore } from "../store";

export type SectionType = "Operations" | "Admin" | "Analytics";

const navItems = {
  Operations: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "inbox", label: "Inbox", icon: Inbox, badge: "4", path: "/inbox" },
    { id: "escalations", label: "Escalations", icon: AlertTriangle, badge: "1", path: "/escalations" },
  ],
  Admin: [
    { id: "onboarding", label: "Quick Setup", icon: Rocket, path: "/onboarding" },
    { id: "kb", label: "Knowledge Base", icon: Database, path: "/knowledge-base" },
    { id: "channels", label: "Channels", icon: Plug, path: "/channels" },
  ],
  Analytics: [
    { id: "insights", label: "Analytics", icon: ChartBar, path: "/analytics" },
  ]
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setToken } = useAppStore();

  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };

  return (
    <aside className="w-[220px] h-full bg-bg-elevated border-r border-border-faint flex flex-col z-20">
      {/* Logo */}
      <div className="p-4 mb-4">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left w-full"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-dim flex items-center justify-center shadow-glow">
            <Sparkles size={16} className="text-white fill-white" />
          </div>
          <div>
            <span className="text-[13px] font-bold text-text-primary tracking-tight">CareAgent</span>
            <div className="text-[9px] font-mono text-text-muted leading-none">v1.2.0-beta</div>
          </div>
        </button>
      </div>

      {/* Nav Items Grouped */}
      <nav className="flex-1 px-2 overflow-y-auto pb-4">
        <div className="space-y-6">
          {(Object.keys(navItems) as SectionType[]).map((section) => (
            <div key={section} className="space-y-1">
              <div className="px-3 mb-2 text-[11px] font-bold text-text-muted uppercase tracking-wider">
                {section}
              </div>
              
              {navItems[section as keyof typeof navItems].map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group relative",
                      isActive 
                        ? "bg-brand-faint text-brand border-l-2 border-brand" 
                        : "text-text-muted hover:bg-surface-high/50 hover:text-text-primary border-l-2 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} className={cn(isActive ? "text-brand" : "text-text-muted group-hover:text-text-primary")} />
                      <span className="text-[13px] font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant={isActive ? "brand" : "default"} size="xs" className="font-mono text-[9px]">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-faint">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <Avatar initials={user?.email ? user.email.substring(0, 2).toUpperCase() : "US"} size={30} variant="purple" />
            <div className="min-w-0">
              <div className="text-[12px] font-bold text-text-primary truncate">
                {user?.email ? user.email.split('@')[0] : "Agent User"}
              </div>
              <div className="text-[10px] text-text-muted font-medium truncate">
                {user?.email || "Support Admin"}
              </div>
            </div>
          </div>
          <IconButton className="opacity-0 group-hover:opacity-100 flex-shrink-0" onClick={handleLogout} title="Log Out">
            <Settings size={14} />
          </IconButton>
        </div>
      </div>
    </aside>
  );
};
