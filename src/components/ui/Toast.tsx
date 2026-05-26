import { cn } from "@/src/lib/utils";
import { Info, CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ToastType = "info" | "success" | "error";

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onDismiss: (id: string) => void;
}

const icons = {
  info: <Info size={16} className="text-brand" />,
  success: <CheckCircle2 size={16} className="text-success" />,
  error: <AlertCircle size={16} className="text-danger" />,
};

const variants = {
  info: "bg-brand-faint border-brand/20",
  success: "bg-success-faint border-success/20",
  error: "bg-danger-faint border-danger/20",
};

export const Toast = ({ id, message, type = "info", onDismiss }: ToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border shadow-modal min-w-[240px] max-w-[320px] pointer-events-auto",
        variants[type]
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-[13px] text-text-primary flex-1">{message}</p>
      <button 
        onClick={() => onDismiss(id)}
        className="p-1 hover:bg-surface-high rounded-md transition-colors"
      >
        <X size={14} className="text-text-muted" />
      </button>
    </motion.div>
  );
};
