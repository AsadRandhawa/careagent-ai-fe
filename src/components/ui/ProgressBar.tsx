import { cn } from "@/src/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const ProgressBar = ({ 
  value, 
  max = 100, 
  height = 4, 
  color = "bg-brand",
  className 
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div 
      className={cn("w-full bg-border-faint rounded-full overflow-hidden", className)}
      style={{ height }}
    >
      <div
        className={cn("h-full transition-all duration-700 ease-out", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
