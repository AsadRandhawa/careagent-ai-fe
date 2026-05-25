import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";

interface FlowStepProps {
  number: number;
  title: string;
  description: string;
  status: "done" | "active" | "locked";
  isLast?: boolean;
}

export const FlowStep = ({ number, title, description, status, isLast }: FlowStepProps) => {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-200",
          status === "done" && "bg-success border-success text-white",
          status === "active" && "bg-brand/10 border-brand text-brand",
          status === "locked" && "bg-transparent border-border-strong text-text-muted"
        )}>
          {status === "done" ? <Check size={14} strokeWidth={3} /> : number}
        </div>
        {!isLast && (
          <div className={cn(
            "w-px flex-1 my-1 transition-all duration-200",
            status === "done" ? "bg-success" : "bg-border-faint"
          )} />
        )}
      </div>
      
      <div className={cn("pb-8", status === "locked" && "opacity-60")}>
        <h4 className={cn(
          "text-[14px] font-semibold mb-1 transition-colors duration-200",
          status === "active" ? "text-text-primary" : status === "done" ? "text-text-primary" : "text-text-muted"
        )}>
          {title}
        </h4>
        <p className="text-[13px] text-text-muted max-w-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
