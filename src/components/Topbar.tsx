import * as React from "react";
import { Search, Bell, HelpCircle } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Dot } from "./ui/AtomsMisc";
import { IconButton } from "./ui/IconButton";

export const Topbar = () => {
  return (
    <header className="h-[52px] w-full bg-bg-elevated border-b border-border-faint flex items-center justify-between px-6 z-30">
      {/* Search */}
      <div className="relative w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
        <input 
          type="text" 
          placeholder="Search everything..."
          className="w-full bg-bg border border-border-mid rounded-xl h-8 pl-9 pr-12 text-[12px] text-text-primary placeholder:text-text-muted outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface border border-border-faint rounded-md px-1 py-0.5 pointer-events-none">
          <span className="text-[9px] font-bold text-text-muted tracking-tighter lowercase">⌘K</span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <Badge variant="success" size="sm" className="bg-success-faint border-success/10 gap-2 h-7 px-3">
          <Dot pulse color="bg-success" />
          <span className="font-semibold text-success uppercase tracking-wider text-[10px]">AI Active</span>
        </Badge>
        
        <div className="flex items-center gap-1 border-l border-border-faint pl-4">
          <IconButton>
            <Bell size={16} />
          </IconButton>
          <IconButton>
            <HelpCircle size={16} />
          </IconButton>
        </div>
      </div>
    </header>
  );
};
