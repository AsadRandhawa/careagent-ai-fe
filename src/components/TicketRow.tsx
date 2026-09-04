import * as React from "react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";
import { cn } from "@/src/lib/utils";
import { Sparkles } from "lucide-react";

export interface TicketRowProps {
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
}: TicketRowProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center py-4 px-4 cursor-pointer border-b border-border-faint transition-all duration-150",
        selected
          ? "bg-brand/5 border-l-2 border-l-brand"
          : "hover:bg-surface-high border-l-2 border-l-transparent",
        className
      )}
    >
      <Avatar initials={initials} size={40} variant={avatarVariant} />

      <div className="flex-1 min-w-0 ml-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px] font-bold text-text-primary truncate">{customerName}</span>
          <span className="text-[11px] font-medium text-text-muted">{time}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px] text-text-muted truncate mr-4">{subject}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
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
