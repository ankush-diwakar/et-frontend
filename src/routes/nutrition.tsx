import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/etato/Section";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import webbg from "@/assets/webbg.webp";
import saladfly from "@/assets/saladfly.png";
import { NutritionCarousel } from "@/components/etato/NutritionCarousel";
import { ArrowRight, Leaf as LeafIcon, ShieldCheck, HandHeart, Sparkles, Dumbbell, HeartPulse, Salad, Soup, Droplet, LeafyGreen } from "lucide-react";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — Etato Foods · Per-Bowl Protein, Carbs, Calories" },
      { name: "description", content: "Full nutrition breakdown for every Etato bowl. Protein, carbs, fat, fiber, calories — transparent and per serving." },
    ],
  }),
  component: NutritionPage,
});


const FEATURES_MARQUEE_ITEMS = [
  { label: "Veggies Diced Daily", icon: Salad },
  { label: "Reusable Bowls", icon: Soup },
  { label: "Homemade Dressings", icon: Droplet },
  { label: "Fresh-Prepped Salads", icon: LeafyGreen },
];

function NutritionPage() {
  const [eats, setEats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ items: any[] }>("/menu").then((data) => {
      setEats(data.items.filter(i => i.status === "ACTIVE"));
    }).finally(() => setLoading(false));
  }, []);
  const maxProtein = 30;

  return (
    <>
      <section className="bg-[#0A472E]">
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9D909] mb-3">Real Numbers · No Hiding</p>
          <h1 className="font-display text-4xl sm:text-6xl text-white leading-tight">
            Nutrition you can <span className="font-script text-[#C9D909]">see.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-white/70 font-light">
            Every Etato bowl lists exact protein, carbs, fat and fiber — not hidden behind vague labels.
          </p>
        </div>
      </section>



      {loading ? (
        <div className="flex justify-center items-center h-[95vh] w-full bg-[#FAFAF7]">
          <Loader2 className="h-10 w-10 animate-spin text-[#0A472E]" />
        </div>
      ) : (
        <NutritionCarousel items={eats} />
      )}


      {/* ── Features Marquee ───────────────────────────────── */}
      <section className="bg-[#0A472E] text-white py-2 overflow-hidden flex items-center relative z-20">
        <div className="flex whitespace-nowrap animate-marquee w-max items-center">
          {[...FEATURES_MARQUEE_ITEMS, ...FEATURES_MARQUEE_ITEMS, ...FEATURES_MARQUEE_ITEMS, ...FEATURES_MARQUEE_ITEMS].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-8 border-r border-white/20">
                <span className="font-display  font-extrabold text-sm sm:text-base tracking-wide">{item.label}</span>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} />
              </div>
            );
          })}
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="bg-[#FFFDF6] overflow-hidden flex flex-col justify-center w-full min-h-[90vh] py-12 lg:py-8">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="mb-8 lg:mb-4 text-center lg:text-left relative z-20">
            <h2 className="font-script text-[#0A472E] text-6xl sm:text-7xl lg:text-[8rem] leading-[0.85]">
              What Makes Us
            </h2>
            <p className="font-script text-[#C9D909] text-5xl sm:text-6xl lg:text-[6.5rem] leading-none mt-1 lg:ml-8">
              Different?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-6 lg:gap-8 items-center relative">
            {/* Background Burst - Positioned absolutely to the section or grid center */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
              <img
                src={webbg}
                alt=""
                className="w-[150%] max-w-[650px] lg:max-w-[950px] opacity-100"
              />
            </div>

            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6 z-10 relative">
              <div className="bg-white rounded-[15px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#d0ddd4]/30 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-script text-3xl text-[#0A472E] mb-1">Handmade</h3>
                <p className="text-[#5a7060] text-[13px] leading-relaxed">
                  Our Handmade Salads are crafted with care, showcasing unique artistry and attention to detail.
                </p>
              </div>
              <div className="bg-white rounded-[15px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#d0ddd4]/30 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-script text-3xl text-[#0A472E] mb-1">100% Natural</h3>
                <p className="text-[#5a7060] text-[13px] leading-relaxed">
                  Our Salads are 100% natural, free from artificial additives, and made with pure ingredients.
                </p>
              </div>
              <div className="bg-white rounded-[15px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#d0ddd4]/30 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-script text-3xl text-[#0A472E] mb-1">Curated Products</h3>
                <p className="text-[#5a7060] text-[13px] leading-relaxed">
                  Indulge in our curated salads, meticulously crafted with a selection of fresh and artfully combined to create a delightful and satisfying dining experience.
                </p>
              </div>
            </div>

            {/* Center Column - Salad Bowl */}
            <div className="relative flex justify-center items-center py-10 lg:py-0 z-10">
              <img
                src={saladfly}
                alt="Fresh Salad Bowl"
                className="relative w-full max-w-[500px] lg:max-w-[650px] animate-float-subtle drop-shadow-[0_20px_50px_rgba(0,0,0,0.25)] scale-110"
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6 z-10 relative">
              <div className="bg-white rounded-[15px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#d0ddd4]/30 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-script text-3xl text-[#0A472E] mb-1">Fresh Salads</h3>
                <p className="text-[#5a7060] text-[13px] leading-relaxed">
                  Experience the crispness and vibrancy of our fresh salads, made with the finest and wholesome ingredients.
                </p>
              </div>
              <div className="bg-white rounded-[15px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#d0ddd4]/30 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-script text-3xl text-[#0A472E] mb-1">Best Quality</h3>
                <p className="text-[#5a7060] text-[13px] leading-relaxed">
                  We pride ourselves on delivering the highest quality that meets and exceeds your expectations.
                </p>
              </div>
              <div className="bg-white rounded-[15px] p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#d0ddd4]/30 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="font-script text-3xl text-[#0A472E] mb-1">Fast Delivery</h3>
                <p className="text-[#5a7060] text-[13px] leading-relaxed">
                  Enjoy swift and efficient delivery service, ensuring your order arrives promptly and conveniently to your doorstep, so you can savor our products without delay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <Section bg="mint">
        <SectionTitle eyebrow="Side by side" title="Protein comparison" />
        <div className="bg-white rounded-[15px] p-6 sm:p-10 border-2 border-[#d0ddd4] shadow-[4px_6px_0px_0px_#C9D909] space-y-5">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-[#0A472E]" /></div>
          ) : (
            eats.map((b) => {
              const num = parseInt(b.protein);
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm font-bold mb-1.5 text-[#0A472E]">
                    <span>{b.name}</span>
                    <span>{b.protein}</span>
                  </div>
                  <div className="h-3 bg-[#f0f5d0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9D909] rounded-full transition-all" style={{ width: `${(num / maxProtein) * 100}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Section>

      <Section bg="default">
        <div className="bg-[#f0f5d0] border-2 border-[#C9D909]/40 rounded-[15px] p-6 sm:p-8 max-w-3xl mx-auto">
          <h3 className="font-display text-2xl text-[#0A472E]">What does 25g of protein look like?</h3>
          <p className="mt-3 text-sm text-[#5a7060] leading-relaxed font-light">
            Roughly 100g of paneer + a handful of sprouts + seeds. Etato bowls are designed so you hit your daily protein
            without piecing meals together.
          </p>
          <p className="mt-4 text-xs text-[#5a7060]/80 font-light">
            * All values are per-serving estimates. Prepared fresh daily — actual values may vary slightly.
          </p>
        </div>
      </Section> */}
    </>
  );
}
