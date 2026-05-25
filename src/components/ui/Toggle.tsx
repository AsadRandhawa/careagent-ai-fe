import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Toggle = ({ checked, onChange, className }: ToggleProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-[38px] h-[22px] rounded-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-brand/40",
        checked ? "bg-brand" : "bg-bg-elevated border border-border-strong",
        className
      )}
    >
      <motion.div
        animate={{ x: checked ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
};
