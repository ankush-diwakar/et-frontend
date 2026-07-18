import { useState } from "react";
import { X } from "lucide-react";

const MARQUEE_ITEMS = [
  "💚 Proudly Serving from Katraj, Pune",
  "🥗 100% Pure Vegetarian Kitchen",
  "🌱 Jain Options Available",
  "💪 High Protein Healthy Bowls",
  "🚚 Freshly Delivered Daily",
  "🏋️ Gym Meal Supply Available",
  "📍 Serving Katraj & Nearby Pune (5–10 KM)"
];

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-[#0A472E] text-white text-xs sm:text-sm relative flex items-center overflow-hidden h-10 border-b border-[#C9D909]/20 z-50">
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] w-max items-center h-full">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="mx-6 font-bold tracking-wide">
            {item}
          </span>
        ))}
      </div>
      {/* Faded edges to ensure the close button is visible */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A472E] to-transparent z-10 pointer-events-none" />
      <button 
        onClick={() => setOpen(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-[#0A472E]/80 hover:bg-[#C9D909] hover:text-[#0A472E] rounded-full transition-colors z-20 cursor-pointer border border-transparent hover:border-[#C9D909]"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
