import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/etato/Section";
import { DeliveryMap } from "@/components/etato/DeliveryMap";
import founderImg from "@/assets/founder.png";
import { Leaf as LeafIcon, ShieldCheck, HandHeart, Sparkles, ArrowRight, Salad, Soup, Droplet, LeafyGreen } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES_MARQUEE_ITEMS = [
  { label: "Veggies Diced Daily", icon: Salad },
  { label: "Reusable Bowls", icon: Soup },
  { label: "Homemade Dressings", icon: Droplet },
  { label: "Fresh-Prepped Salads", icon: LeafyGreen },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Etato Foods — Our Story · Katraj, Pune" },
      { name: "description", content: "Founded by Aakanksha Kokane in Katraj, Pune. Etato Foods crafts fresh, high-protein, 100% pure veg salad bowls daily." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="flex flex-col-reverse lg:flex-row w-full lg:h-[90vh] min-h-[90vh] bg-[#f0f5d0] overflow-hidden">
        {/* Left Side: Text */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 text-center lg:text-left">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#0A472E] mb-4">Founder · Etato Foods</p>
            <blockquote className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight text-[#0A472E] mb-6">
              "Healthy should never mean <span className="font-script text-[#C9D909]">boring.</span>"
            </blockquote>
            <p className="text-sm text-[#5a7060] leading-relaxed mb-6">
              Every Etato bowl is made with ingredients you can trust, nutrition you can see, and taste you will love.
            </p>
            <p className="text-sm text-[#5a7060] font-bold tracking-wide uppercase">— Aakanksha Kokane</p>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-full flex items-center justify-center bg-[#f0f5d0]">
          <img 
            src={founderImg} 
            alt="Aakanksha Kokane, Founder of Etato Foods" 
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* ── Features Marquee ───────────────────────────────── */}
      <section className="bg-[#0A472E] text-white py-2 overflow-hidden flex items-center relative z-20">
        <div className="flex whitespace-nowrap animate-marquee w-max items-center">
          {[...FEATURES_MARQUEE_ITEMS, ...FEATURES_MARQUEE_ITEMS, ...FEATURES_MARQUEE_ITEMS, ...FEATURES_MARQUEE_ITEMS].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-8 border-r border-white/20">
                <span className="font-display font-extrabold text-sm sm:text-base tracking-wide">{item.label}</span>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} />
              </div>
            );
          })}
        </div>
      </section>

      <Section bg="default">
        <SectionTitle
          eyebrow="Our Story"
          title="Born in Katraj, built for Pune."
          desc="Etato was born from a simple belief that eating healthy should not mean eating boring. Choose Better. Today."
        />
      </Section>

      <Section bg="primary" className="py-16">
        <header className="max-w-2xl mb-10 sm:mb-14 mx-auto text-center">
          <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#C9D909] mb-3">
            What we stand for
          </p>
          <h2 className="font-display text-3xl sm:text-5xl leading-tight text-white">Our values</h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { i: LeafIcon, t: "Fresh Vegetables", d: "Sourced fresh every morning. No frozen ingredients." },
            { i: ShieldCheck, t: "100% Pure Veg", d: "No eggs, no meat, no cross-contamination." },
            { i: HandHeart, t: "Jain Friendly", d: "Jain versions available — no onion, no garlic, no root veg." },
            { i: Sparkles, t: "Hygiene First", d: "Prepared in a clean, FSSAI-registered kitchen." },
          ].map(({ i: Icon, t, d }, idx) => (
            <motion.div 
              key={t} 
              className="h-full"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
            >
              <div className="bg-white rounded-[15px] p-7 border-2 border-[#C9D909] shadow-[4px_6px_0px_0px_#C9D909] hover:-translate-y-3 transition-all duration-300 ease-out cursor-default group relative h-full">
                <Icon className="h-10 w-10 text-[#C9D909] mb-4" strokeWidth={1.5} />
                <h3 className="mt-3 font-display text-xl text-[#0A472E]">{t}</h3>
                <p className="mt-3 text-sm text-[#5a7060] leading-relaxed font-light">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section bg="default">
        <SectionTitle
          eyebrow="Why High Protein"
          title="22–30g of real protein in every bowl."
          desc="Each bowl is engineered around a 22–30g protein target — paneer, soya, sprouts and chickpeas — so eating clean keeps you full, energised and on-track with your goals."
        />
      </Section>

      <Section bg="primary">
        <header className="max-w-2xl mb-10 sm:mb-14 mx-auto text-center">
          <p className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#C9D909] mb-3">
            From kitchen to door
          </p>
          <h2 className="font-display text-3xl sm:text-5xl leading-tight text-white">Our process</h2>
        </header>
        <div className="grid sm:grid-cols-4 gap-5">
          {[
            { n: "01", t: "Source fresh daily" },
            { n: "02", t: "Prep in clean kitchen" },
            { n: "03", t: "Pack carefully" },
            { n: "04", t: "Deliver on time" },
          ].map((s, idx) => (
            <motion.div 
              key={s.n} 
              className="h-full"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
            >
              <div className="bg-white rounded-[15px] p-7 border-2 border-[#C9D909] shadow-[4px_6px_0px_0px_#C9D909] hover:-translate-y-3 transition-all duration-300 ease-out cursor-default group relative h-full">
                <span className="font-script text-4xl text-[#C9D909]">{s.n}</span>
                <h3 className="mt-3 font-display text-xl text-[#0A472E]">{s.t}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section bg="default">
        <SectionTitle
          eyebrow="Delivery Zone"
          title="We deliver across south-west Pune."
          desc="Sinhagad Road · Dhayari · Narhe · Ambegaon · Katraj — within 5–10 km of our Katraj Dairy kitchen."
        />
        <DeliveryMap className="mt-8" />
      </Section>
    </>
  );
}
