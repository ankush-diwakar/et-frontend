import { cn } from "@/lib/utils";

export function Leaf({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-leaf", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M32 4C20 14 8 18 4 22c0 22 12 36 28 38 16-2 28-16 28-38-4-4-16-8-28-18Z" opacity="0.18" />
      <path d="M32 12c-8 8-16 12-20 16 2 16 10 26 20 28V12Z" opacity="0.35" />
    </svg>
  );
}

export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("inline-block", className)} fill="currentColor" aria-hidden>
      <path d="M12 2C17.5 6.5 19 11.5 17 15.5C15 19.5 12 21 12 21C12 21 9 19.5 7 15.5C5 11.5 6.5 6.5 12 2Z" />
    </svg>
  );
}
