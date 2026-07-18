import { cn } from "@/lib/utils";

interface PlaceholderProps {
  label?: string;
  className?: string;
  ratio?: "square" | "video" | "portrait" | "wide";
}

const ratioMap = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/7]",
};

export function Placeholder({ label = "Photo coming soon", className, ratio = "square" }: PlaceholderProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-mint flex items-center justify-center",
        ratioMap[ratio],
        className
      )}
    >
      <div className="absolute inset-0 bg-leaf-pattern opacity-70" />
      <div className="relative flex flex-col items-center gap-2 text-mint-foreground/70 px-4 text-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C9 6 6 7 4 8c0 8 4 12 8 12s8-4 8-12c-2-1-5-2-8-6Z" />
          <path d="M12 8v12" />
        </svg>
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
    </div>
  );
}
