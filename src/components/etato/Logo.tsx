import { cn } from "@/lib/utils";
import weblogo from "@/assets/weblogo.png";

export function Logo({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={weblogo}
        alt="Etato Foods"
        className={cn(
          "h-10 sm:h-12 w-auto object-contain",
          variant === "light" && "brightness-0 invert"
        )}
      />
    </div>
  );
}
