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
  className?: string;
  key?: string | number;
}

export const ChannelRow = ({ name, description, icon, connected, onConnect, onDisconnect, className, ...props }: ChannelRowProps) => {
  // The toggle is now the single control for connected channels — no
  // separate button/icon alongside it. While connected it always shows
  // ON; switching it off disconnects (with a confirmation, since that's
  // a real, destructive action — losing the stored token/connection,
  // not something a stray click should do silently).
  const handleToggleChange = (val: boolean) => {
    if (val) return; // already connected — nothing to do turning "on" again
    if (window.confirm(`Disconnect ${name}? You'll need to reconnect it to receive messages again.`)) {
      onDisconnect?.();
    }
  };

  return (
    <div className={cn("flex items-center justify-between p-3 bg-bg-elevated border border-border-mid rounded-xl mb-3", className)} {...props}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-surface border border-border-strong rounded-lg text-text-muted">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary">{name}</span>
            {connected && <Badge variant="success" size="xs">Connected</Badge>}
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
        </div>
      </div>

      {connected ? (
        <Toggle checked={true} onChange={handleToggleChange} />
      ) : (
        <Button size="sm" variant="surface" onClick={onConnect}>Connect</Button>
      )}
    </div>
  );
};
