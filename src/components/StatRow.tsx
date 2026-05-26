import { cn } from "@/src/lib/utils";

interface StatRowProps {
  label: string;
  value: string | number;
  valueColor?: string;
  isMono?: boolean;
}

export const StatRow = ({ label, value, valueColor, isMono = true }: StatRowProps) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-faint last:border-0">
      <span className="text-[12px] text-text-muted">{label}</span>
      <span className={cn(
        "text-[13px] font-semibold",
        isMono && "font-mono",
        valueColor ? valueColor : "text-text-primary"
      )}>
        {value}
      </span>
    </div>
  );
};
