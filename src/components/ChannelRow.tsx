import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Badge } from "./ui/Badge";
import { Toggle } from "./ui/Toggle";
import { Button } from "./ui/Button";
import { Unlink } from "lucide-react";

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

export const ChannelRow = ({ name, description, icon, connected, enabled, onToggle, onConnect, onDisconnect, className, ...props }: ChannelRowProps) => {
  // `enabled` controls the toggle state when connected; defaults to `connected`
  const toggleChecked = enabled !== undefined ? enabled : connected;

  const handleDisconnect = () => {
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
            {connected && toggleChecked && <Badge variant="success" size="xs">Connected</Badge>}
            {connected && !toggleChecked && <Badge variant="default" size="xs">Paused</Badge>}
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
        </div>
      </div>

      {connected ? (
        <div className="flex items-center gap-3">
          <Toggle checked={toggleChecked} onChange={onToggle} />
          {onDisconnect && (
            <button
              onClick={handleDisconnect}
              title={`Disconnect ${name}`}
              className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Unlink size={14} />
            </button>
          )}
        </div>
      ) : (
        <Button size="sm" variant="surface" onClick={onConnect}>Connect</Button>
      )}
    </div>
  );
};
