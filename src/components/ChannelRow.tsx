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
  className?: string;
  key?: string | number;
}

export const ChannelRow = ({ name, description, icon, connected, enabled, onToggle, onConnect, className, ...props }: ChannelRowProps) => {
  // `enabled` controls the toggle state when connected; defaults to `connected`
  const toggleChecked = enabled !== undefined ? enabled : connected;

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
        <Toggle checked={toggleChecked} onChange={onToggle} />
      ) : (
        <Button size="sm" variant="surface" onClick={onConnect}>Connect</Button>
      )}
    </div>
  );
};
