import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/etato/Section";
import { BowlCard } from "@/components/etato/BowlCard";
import { Leaf } from "@/components/etato/Leaf";
import { ArrowRight, Leaf as LeafIcon, ShieldCheck, HandHeart, Sparkles, Dumbbell, HeartPulse, Loader2, Salad, Soup, Droplet, LeafyGreen, ShoppingBag, Package, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import heroBowl from "@/assets/hero-bowl.jpg";
import heroVideo from "@/assets/hero.mp4";
import founderImg from "@/assets/founder.png";
import paneerPunch from "@/assets/bowl-paneer-punch.jpg";
import { NotInsideFood } from "@/components/etato/NotInsideFood";
import saladfly from "@/assets/saladfly.png";
import saladfly3 from "@/assets/saladfly3.png";
import saladfly4 from "@/assets/saladfly4.png";
import saladfly5 from "@/assets/saladfly5.png";
import webbg from "@/assets/webbg.webp";
import freshvegitablesSVG from "@/assets/freshvegitables.svg";
import freshvegitablesfPNG from "@/assets/freshvegitablesf.png";
import vegitablesptPNG from "@/assets/vegitablespt.png";
import bgptAVIF from "@/assets/bgpt.avif";

const HERO_IMAGES = [saladfly, saladfly3, saladfly4, saladfly5];

const FEATURES_MARQUEE_ITEMS = [
  { label: "Veggies Diced Daily", icon: Salad },
  { label: "Reusable Bowls", icon: Soup },
  { label: "Homemade Dressings", icon: Droplet },
  { label: "Fresh-Prepped Salads", icon: LeafyGreen },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Etato Foods — Fresh Protein Salad Bowls in Katraj, Pune" },
      { name: "description", content: "Fresh daily, 100% Pure Veg, Jain-friendly protein bowls delivered in Katraj, Pune. Mon–Sat. Choose Better. Today." },
    ],
  }),
  component: Home,
});

const USPS = [
  { icon: LeafIcon, label: "Fresh Daily" },
  { icon: ShieldCheck, label: "100% Pure Veg" },
  { icon: HandHeart, label: "Jain Options" },
  { icon: Sparkles, label: "Hygienic Kitchen" },
  { icon: Dumbbell, label: "High Protein" },
  { icon: HeartPulse, label: "Healthy Lifestyle" },
];

function ShapoReviews() {
  useEffect(() => {
    const scriptId = "shapo-embed-js";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "text/javascript";
    script.src = "https://cdn.shapo.io/js/embed.js";
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const activeScript = document.getElementById(scriptId);
      if (activeScript) activeScript.remove();
    };
  }, []);

  return (
    <div
      id="shapo-widget-7d36dbe8f8575cc677b8"
      className="w-full overflow-hidden [&>iframe]:!mb-[-65px] [&>iframe]:!block"
    ></div>
  );
}

function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [heroAnimating, setHeroAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroAnimating(true);
      setTimeout(() => {
        setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        setHeroAnimating(false);
      }, 600); // Wait for exit animation to complete
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api<{ items: any[] }>("/menu")
      .then((data) => {
        setFeatured(data.items.filter(i => i.status !== "INACTIVE").slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-white">
        {/* Fading Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: `url(${bgptAVIF})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)'
          }} 
        />
        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#0A472E] bg-[#f0f5d0] px-4 py-2 rounded-full border border-[#C9D909]/60">
              <span className="veg-dot border-[#0A472E]" style={{ borderColor: '#0A472E' }} />
              Cloud Kitchen · Katraj, Pune
            </span>

            <h1 className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#0A472E]">
              Fresh.<br />
              Protein-Rich.<br />
              <span className="font-script text-[#C9D909] text-5xl sm:text-7xl lg:text-8xl drop-shadow-sm">Made for you.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#5a7060] max-w-md leading-relaxed font-medium">
              Freshly crafted in Katraj, Pune, with real ingredients and 22–30g of protein in every bowl.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="font-display btn-primary">
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/subscribe"
                className="font-display btn-secondary border-[#0A472E] text-[#0A472E] hover:bg-[#0A472E]/5"
              >
                Subscribe &amp; Save
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-[#5a7060] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="veg-dot border-[#0A472E]" style={{ borderColor: '#0A472E' }} />
                100% Pure Veg
              </span>
              <span>·</span>
              <span>Mon–Sat</span>
              <span>·</span>
              <span>FSSAI Registered</span>
            </div>
          </div>

          {/* Right Column - Floating Salad Carousel */}
          <div className="relative flex justify-center items-center py-10 lg:py-0 min-h-[400px] lg:min-h-[500px]">
            {/* Background Burst */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
              <img
                src={webbg}
                alt="Background effect"
                className="w-[120%] lg:w-[150%] max-w-[650px] lg:max-w-[950px] opacity-100"
              />
            </div>

            {/* Bouncing & Floating Salad */}
            <div className="relative z-10 w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[550px] animate-float-subtle">
              <img
                src={HERO_IMAGES[heroImageIndex]}
                alt="Fresh Salad Bowl"
                className={`relative w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.35)] transform transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${heroAnimating ? 'opacity-0 translate-y-24 scale-95' : 'opacity-100 translate-y-0 scale-110'}
                `}
              />
            </div>

            {/* Protein badge — desktop */}
            <div className="hidden lg:flex absolute bottom-0 right-0 z-20">
              <div className="bg-[#0A472E] border-2 border-[#C9D909] rounded-[15px] p-6 flex items-center gap-4 shadow-[4px_6px_0px_0px_#C9D909] transform hover:-translate-y-1 transition-transform">
                <div className="bg-[#C9D909] w-14 h-14 rounded-[15px] flex items-center justify-center">
                  <Dumbbell className="h-7 w-7 text-[#0A472E]" />
                </div>
                <div>
                  <p className="text-4xl font-display text-white leading-none">25g+</p>
                  <p className="text-xs text-white/70 uppercase tracking-wider mt-1 font-medium">Protein per bowl</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ── What's NOT Inside Our Food & Stats ─────────────── */}
      <NotInsideFood />


      {/* ── Launch offer ───────────────────────────────────── */}
      {/* <section className="bg-[#f0f5d0] border-y-2 border-[#C9D909]/40">
        <div className="container mx-auto px-4 py-7 text-center">
          <p className="text-sm sm:text-base font-medium text-[#0A472E]">
            🎉 <span className="font-bold">Special Launch Offer</span> — 10% OFF for our first 50 customers!
            Use code{" "}
            <span className="inline-flex items-center font-bold tracking-widest bg-[#C9D909] text-[#0A472E] px-3 py-0.5 rounded-[4px]">
              ETATO10
            </span>{" "}
            at checkout.
          </p>
        </div>
      </section> */}

      {/* ── Featured Bowls ─────────────────────────────────── */}
      <Section bg="default">
        <SectionTitle
          eyebrow="Our Signature Bowls"
          title="Bowls crafted for your goals"
          desc="Each bowl delivers 22–30g of protein, fresh-prepped daily, and built around real ingredients you can pronounce."
        />
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#0A472E]" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((bowl, idx) => (
              <motion.div 
                key={bowl.id} 
                className="h-full"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
              >
                <BowlCard
                  bowl={{
                    id: bowl.id,
                    name: bowl.name,
                    category: bowl.category?.name,
                    ingredients: bowl.ingredients,
                    dressing: bowl.dressing,
                    protein: bowl.protein,
                    calories: bowl.calories,
                    carbs: bowl.carbs,
                    price: bowl.price || null,
                    image: bowl.imageUrl,
                    comingSoon: bowl.status === "COMING_SOON",
                    notAvailable: bowl.status === "NOT_AVAILABLE",
                    jain: bowl.jain
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/menu" className="btn-primary">
            View Full Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ── USP strip ──────────────────────────────────────── */}
      <section className="bg-[#0A472E] border-y-2 border-[#C9D909]">
        <div className="container mx-auto px-4 py-5 overflow-x-auto no-scrollbar">
          <ul className="flex gap-8 sm:justify-around items-center min-w-max sm:min-w-0 text-white">
            {USPS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 shrink-0">
                <Icon className="h-5 w-5 text-[#C9D909]" />
                <span className="text-sm font-bold">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>



      {/* ── How it works ───────────────────────────────────── */}
      <Section bg="mint">
        <SectionTitle eyebrow="Simple as that" title="How it works" />
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Choose Your Bowl", d: "Pick from our chef-crafted protein bowls or build a subscription." },
            { n: "02", t: "We Prep Fresh", d: "Vegetables sourced daily, prepped in our hygienic Katraj kitchen." },
            { n: "03", t: "Delivered to You", d: "Lunch 12–2:30 PM or Dinner 7–9:30 PM. Mon–Sat. Sunday off." },
          ].map((s, idx) => (
            <motion.div 
              key={s.n} 
              className="bg-white rounded-[15px] p-7 border-2 border-[#C9D909] shadow-[4px_6px_0px_0px_#C9D909]"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
            >
              <span className="font-display text-5xl text-[#C9D909]">{s.n}</span>
              <h3 className="mt-3 font-display text-xl text-[#0A472E]">{s.t}</h3>
              <p className="mt-3 text-sm text-[#5a7060] leading-relaxed font-light">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Subscription teaser ────────────────────────────── */}
      <Section bg="default">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#0A472E] mb-3">Salad Subscription</p>
            <h2 className="font-display text-3xl sm:text-5xl leading-tight text-[#0A472E]">Save more with a weekly plan.</h2>
            <p className=" mt-4 text-[#5a7060] leading-relaxed font-light">
              Lock in your healthy week. Save up to 20% per bowl, switch your bowl any time on WhatsApp, pause when you need to.
            </p>
            <Link to="/subscribe" className="font-display btn-primary mt-6 inline-flex">
              See All Plans <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: "Weekly", d: "6 days", o: 1494, p: 1419, save: "₹75", best: true },
              { t: "Monthly", d: "26 days", o: 6474, p: 5699, save: "₹775", best: false },
            ].map((p, idx) => (
              <motion.div
                key={p.t}
                className={`relative rounded-[15px] p-5 ${p.best
                  ? "bg-[#0A472E] text-white border-2 border-[#C9D909] shadow-[4px_6px_0px_0px_#C9D909]"
                  : "bg-white text-[#0A472E] border-2 border-[#d0ddd4]"
                  }`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
              >
                {p.best && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-[#C9D909] text-[#0A472E] px-3 py-0.5 font-bold rounded-full border border-[#0A472E]">
                    Popular
                  </span>
                )}
                <p className={`text-xs uppercase tracking-wider font-bold ${p.best ? "text-[#C9D909]" : "text-[#0A472E]"}`}>{p.t}</p>
                <p className="font-display text-2xl mt-1">{p.d}</p>
                <p className={`text-xs line-through opacity-60 mt-3`}>₹{p.o}</p>
                <p className="font-display text-3xl">₹{p.p}</p>
                <p className="text-[11px] mt-1 opacity-80">Save {p.save}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── About strip ────────────────────────────────────── */}
      <section className="flex flex-col-reverse lg:flex-row w-full lg:h-[90vh] min-h-[90vh] bg-[#f0f5d0] overflow-hidden">
        {/* Left Side: Text */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 text-center lg:text-left">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#0A472E] mb-4">Our Story</p>
            <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl leading-snug text-[#0A472E] mb-6">
              "At Etato, every bowl is made with ingredients you can trust, nutrition you can see, and taste you will love."
            </blockquote>
            <p className="text-sm text-[#5a7060] font-bold tracking-wide uppercase">— Aakanksha Kokane, Founder</p>
            <Link to="/about" className="btn-link mt-8 inline-flex font-semibold text-sm">
              Read Our Story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="w-full lg:w-1/2 h-[40vh] lg:h-full flex items-center justify-center bg-[#f0f5d0]">
          <img 
            src={founderImg} 
            alt="Founder" 
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* ── Nutrition transparency ─────────────────────────── */}
      <section className="relative flex flex-col lg:flex-row min-h-[90vh] bg-[#0A472E] overflow-hidden mb-10 lg:mb-0">
        {/* Left Side Image */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto">
          <img 
            src={freshvegitablesfPNG} 
            alt="Fresh Vegetables" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side Content */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 text-center">
          {/* Subtle Background Pattern */}
          <div className="absolute bottom-0 right-0 pointer-events-none opacity-40 translate-x-1/4 translate-y-1/4 lg:translate-x-0 lg:translate-y-0">
            <img src={vegitablesptPNG} alt="" className="w-64 sm:w-72 lg:w-80 object-contain" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-white mb-6">
              Farm-Fresh<br />
              Ingredients For A<br />
              Healthier You
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-10 max-w-md font-medium">
              From handpicked, organic produce to nutrient-packed meals, we ensure every bite is fresh, delicious, and wholesome.
            </p>
            <Link to="/menu" className="font-display inline-flex items-center justify-center gap-2 bg-[#9bc54b] text-[#0A472E] px-8 py-3.5 rounded-lg font-bold hover:bg-[#8ab43a] transition-colors shadow-lg">
              Order Now <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Middle Floating SVG Label */}
        <div className="absolute left-1/2 top-[50vh] lg:top-[20%] -translate-x-1/2 -translate-y-1/2 lg:-translate-y-0 z-20 pointer-events-none">
          <img 
            src={freshvegitablesSVG} 
            alt="Fresh Vegetables Label" 
            className="w-32 sm:w-40 lg:w-48 xl:w-56 drop-shadow-2xl"
          />
        </div>
      </section>

      {/* ── Instagram ──────────────────────────────────────── */}
      <Section bg="default" className="pt-0">
        <SectionTitle eyebrow="Follow our journey" title="@etatofoods" />
        <div 
          className="w-full overflow-hidden rounded-[15px] border-2 border-[#d0ddd4] h-[650px] sm:h-[700px] relative bg-white"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <iframe 
            src="https://widget.taggbox.com/330310?website=1" 
            allow="fullscreen; autoplay" 
            style={{ 
              position: 'absolute',
              top: '-45px',
              left: 0,
              width: 'calc(100% + 24px)', 
              height: 'calc(100% + 95px)', 
              border: 'none',
              overflow: 'hidden'
            }}
          ></iframe>
        </div>
        <div className="mt-8 text-center">
          <a
            href="https://instagram.com/etatofoods"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex"
          >
            Follow on Instagram
          </a>
        </div>
      </Section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="bg-[#0A472E] text-white relative overflow-hidden">
        <Leaf className="absolute -top-10 -left-10 w-72 opacity-10" />
        <Leaf className="absolute -bottom-20 -right-10 w-96 opacity-10 rotate-180" />
        <div className="container mx-auto px-4 py-20 text-center relative">
          <h2 className="font-display text-4xl sm:text-6xl">
            Ready to{" "}
            <span className="font-script text-[#C9D909]">choose better</span>{" "}
            today?
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 justify-center px-4 sm:px-0">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 h-[50px] px-8 rounded-full bg-[#C9D909] text-[#0A472E] font-display font-bold text-[15px] hover:scale-105 transition-transform shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" /> Order Now
            </Link>
            <Link
              to="/subscribe"
              className="inline-flex items-center justify-center gap-2 h-[50px] px-8 rounded-full bg-white text-[#0A472E] font-display font-bold text-[15px] hover:scale-105 transition-transform shadow-lg"
            >
              <Package className="w-5 h-5" /> Subscribe &amp; Save
            </Link>
            <a
              href="https://wa.me/917499934425"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-[50px] px-8 rounded-full border-2 border-white/30 text-white font-display font-bold text-[15px] hover:bg-white/10 hover:border-white/50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
          <p className="mt-6 text-sm opacity-70 font-light">Mon–Sat · Lunch &amp; Dinner · Katraj, Pune</p>
        </div>
      </section>

      {/* ── Reviews ────────────────────────────────────────── */}
      <Section bg="default" className="border-t border-[#d0ddd4]">
        <SectionTitle
          eyebrow="Reviews"
          title="What our community says"
          desc="Hear from our regular subscription and menu customers in Katraj, Pune. Real food, real protein, real reviews."
        />
        <div className="relative mx-auto max-w-5xl bg-white rounded-[15px] p-4 sm:p-8 border-2 border-[#d0ddd4] min-h-[300px]">
          <div className="absolute -top-4 -right-4 bg-[#C9D909] text-[#0A472E] w-10 h-10 rounded-full flex items-center justify-center animate-sway-right shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-[#0A472E] text-[#C9D909] w-10 h-10 rounded-full flex items-center justify-center animate-sway-left shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </div>
          <ShapoReviews />
        </div>

        <div className="mt-10 text-center">
          <a
            href="https://www.google.com/maps/place/ETATO+Foods/@18.4515409,73.8575265,17z/data=!4m17!1m8!3m7!1s0x3bc2eb5f1ac3f04d:0xb25cc55b14f8dcf7!2sETATO+Foods!8m2!3d18.4515409!4d73.8575265!10e9!16s%2Fg%2F11z3xxmg5q!3m7!1s0x3bc2eb5f1ac3f04d:0xb25cc55b14f8dcf7!8m2!3d18.4515409!4d73.8575265!9m1!1b1!16s%2Fg%2F11z3xxmg5q?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer"
            className="btn-primary inline-flex"
          >
            View all Google Reviews <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Section>
    </>
  );
}
