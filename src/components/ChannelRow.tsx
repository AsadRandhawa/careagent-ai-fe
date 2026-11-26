import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Badge } from "./ui/Badge";
import { Toggle } from "./ui/Toggle";
import { Button } from "./ui/Button";

export interface ChannelRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  enabled?: boolean;
  onToggle: (val: boolean) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReply?: boolean;
  onAutoReplyToggle?: (val: boolean) => void;
  className?: string;
  key?: string | number;
}

export const ChannelRow = ({
  name,
  description,
  icon,
  connected,
  enabled,
  onToggle,
  onConnect,
  onDisconnect,
  autoReply = false,
  onAutoReplyToggle,
  className,
  ...props
}: ChannelRowProps) => {
  const handleToggleChange = (val: boolean) => {
    if (!val) {
      if (window.confirm(`Disconnect ${name}? You'll need to reconnect it to receive messages again.`)) {
        onDisconnect?.();
      }
    } else {
      onToggle?.(true);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between p-4 bg-bg-elevated border border-border-mid rounded-xl mb-3 gap-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-surface border border-border-strong rounded-lg text-text-muted">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary truncate">{name}</span>
            {connected && <Badge variant="success" size="xs">Connected</Badge>}
          </div>
          <p className="text-[12px] text-text-muted mt-0.5 truncate">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 justify-between md:justify-end flex-shrink-0">
        {/* Auto-reply switch + helper text */}
        <div className="flex flex-col items-start md:items-end text-left md:text-right min-w-[170px]">
          <div className="flex items-center gap-2">
            <span className={cn("text-[12px] font-medium", connected ? "text-text-primary" : "text-text-muted")}>
              Auto-reply
            </span>
            <Toggle
              checked={connected && autoReply}
              disabled={!connected}
              onChange={(val) => onAutoReplyToggle?.(val)}
            />
          </div>
          <span className="text-[11px] text-text-muted mt-1 leading-snug">
            {connected
              ? (autoReply ? "Sends answers to customers on its own." : "Drafts wait for your approval.")
              : "Connect this channel first."}
          </span>
        </div>

        {/* Existing active toggle or Connect button */}
        <div className="flex items-center pl-2 border-l border-border-faint">
          {connected ? (
            <Toggle checked={enabled ?? true} onChange={handleToggleChange} />
          ) : (
            <Button size="sm" variant="surface" onClick={onConnect}>Connect</Button>
          )}
        </div>
      </div>
    </div>
  );
};
