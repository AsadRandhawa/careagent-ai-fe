import * as React from "react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { cn } from "@/src/lib/utils";
import { Sparkles, MessageCircle, Globe } from "lucide-react";

// Channel icon + color map
const CHANNEL_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  whatsapp: {
    icon: <MessageCircle size={9} />,
    label: "WA",
    color: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/20",
  },
  facebook: {
    icon: (
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    label: "FB",
    color: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/20",
  },
  website: {
    icon: <Globe size={9} />,
    label: "WEB",
    color: "bg-teal/15 text-teal border-teal/20",
  },
  gmail: {
    icon: (
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
      </svg>
    ),
    label: "GM",
    color: "bg-danger/15 text-danger border-danger/20",
  },
};

export interface TicketRowProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  customerName: string;
  initials: string;
  subject: string;
  time: string;
  status: string;
  hasDraft?: boolean;
  selected?: boolean;
  avatarVariant: any;
  className?: string;
  channel?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  key?: string | number;
}

export const TicketRow = ({
  id,
  customerName,
  initials,
  subject,
  time,
  status,
  hasDraft,
  selected,
  onClick,
  avatarVariant,
  className,
  channel,
  ...props
}: TicketRowProps) => {
  const ch = channel ? CHANNEL_META[channel] : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center p-3 cursor-pointer border-b border-border-faint transition-all duration-120",
        selected
          ? "bg-brand-faint border-l-2 border-l-brand"
          : "hover:bg-surface-high/50 border-l-2 border-l-transparent",
        className
      )}
      {...props}
    >
      <Avatar initials={initials} size={32} variant={avatarVariant} />

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[13px] font-semibold text-text-primary truncate">{customerName}</span>
          <span className="text-[10px] font-mono text-text-muted">{time}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-text-muted truncate mr-2">{subject}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Channel badge */}
            {ch && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border",
                  ch.color
                )}
              >
                {ch.icon}
                {ch.label}
              </span>
            )}
            {hasDraft && (
              <Badge variant="brand" size="xs" className="gap-1 bg-brand/10 border-brand/20">
                <Sparkles size={8} /> AI
              </Badge>
            )}
            <Badge
              variant={status === "new" ? "success" : status === "escalated" ? "danger" : "default"}
              size="xs"
              className="uppercase tracking-wider"
            >
              {status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
