import * as React from "react";
import { cn } from "@/src/lib/utils";

export const Spinner = ({ className, size = 16, ...props }: { className?: string, size?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn("border-2 border-surface-high border-t-brand rounded-full animate-spin", className)} 
      style={{ width: size, height: size }}
      {...props}
    />
  );
};

export const Dot = ({ color = "bg-brand", pulse, className, ...props }: { color?: string, pulse?: boolean } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} {...props}>
      {pulse && (
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", color)} />
      )}
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
    </div>
  );
};

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("animate-shimmer rounded-md", className)} {...props} />
  );
};

export const Divider = ({ label, className, ...props }: { label?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex items-center w-full my-4", className)} {...props}>
      <div className="flex-grow h-px bg-border-faint" />
      {label && <span className="mx-4 text-[11px] font-medium text-text-muted uppercase tracking-widest">{label}</span>}
      {label && <div className="flex-grow h-px bg-border-faint" />}
    </div>
  );
};
