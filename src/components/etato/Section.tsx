import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  bg = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  bg?: "default" | "mint" | "primary" | "gold" | "white";
  id?: string;
}) {
  const bgs = {
    default: "bg-[#FFFDF6]",
    mint:    "bg-[#f0f5d0]",
    primary: "bg-[#0A472E] text-white",
    gold:    "bg-[#f5f9e8]",
    white:   "bg-white",
  };
  return (
    <section id={id} className={cn("py-16 sm:py-24", bgs[bg], className)}>
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <header className={cn("max-w-2xl mb-10 sm:mb-14", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#0A472E] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-5xl leading-tight text-[#0A472E]">{title}</h2>
      {desc && (
        <p className="mt-4 text-base sm:text-lg text-[#5a7060] leading-relaxed font-light">
          {desc}
        </p>
      )}
    </header>
  );
}
