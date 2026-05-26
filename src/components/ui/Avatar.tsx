import { cn } from "@/src/lib/utils";

interface AvatarProps {
  initials: string;
  size?: number;
  variant?: "blue" | "teal" | "purple" | "warn" | "green" | "danger";
  isEscalated?: boolean;
}

const variantStyles = {
  blue: "bg-brand/20 text-brand",
  teal: "bg-teal/20 text-teal",
  purple: "bg-purple/20 text-purple",
  warn: "bg-warn/20 text-warn",
  green: "bg-success/20 text-success",
  danger: "bg-danger/20 text-danger",
};

export const Avatar = ({ initials, size = 32, variant = "blue", isEscalated }: AvatarProps) => {
  const sizeValue = Number(size);
  return (
    <div className="relative inline-flex items-center justify-center">
      {isEscalated && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-bg ring-4 ring-danger p-[4px]"
          style={{ width: size + 8, height: size + 8, left: -4, top: -4 }}
        />
      )}
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-mono font-bold uppercase",
          variantStyles[variant]
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials.slice(0, 2)}
      </div>
    </div>
  );
};
