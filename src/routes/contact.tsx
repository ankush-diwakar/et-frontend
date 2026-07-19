import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, SectionTitle } from "@/components/etato/Section";
import { Phone, Mail, Instagram, MapPin, Clock, Check, ArrowDown } from "lucide-react";
import { api } from "@/lib/api";
import faqbg from "@/assets/faqbg.webp";
import stamp from "@/assets/stamp.png";
import { ArrowRight, Leaf as LeafIcon, ShieldCheck, HandHeart, Sparkles, Dumbbell, HeartPulse, Loader2, Salad, Soup, Droplet, LeafyGreen } from "lucide-react";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Etato Foods — Katraj, Pune · WhatsApp +91 74999 34425" },
      { name: "description", content: "Reach Etato Foods in Katraj, Pune. WhatsApp, Instagram, email, address, hours and FAQ." },
    ],
  }),
  component: ContactPage,
});

const FAQ = [
  ["Delivery & Timing", "We've got you covered every day of the week! ETATO delivers fresh meals 7 days a week. Our delivery operations run from 9:00 AM to 10:00 PM.\n\n• Lunch slot: 12:00 PM – 2:30 PM\n• Dinner slot: 7:00 PM – 9:30 PM"],
  ["Service Areas", "We currently serve Katraj and nearby locations across Pune. If you're unsure whether your exact location falls within our delivery radius, feel free to reach out to us on WhatsApp!"],
  ["Jain Options", "Absolutely! We understand dietary preferences and offer Jain options for all of our salad bowls. Just let us know your requirements when placing your order."],
  ["Vegetarian Policy", "Yes! ETATO operates a 100% pure vegetarian cloud kitchen. We maintain strict hygiene standards to ensure completely vegetarian meal prep with no cross-contamination."],
  ["Protein Information", "We take your nutrition seriously. Every single ETATO bowl is carefully crafted to pack a punch, containing between 22g and 30g of high-quality protein to keep you fueled."],
  ["Subscription Processing", "Once you book a subscription with us, we get straight to work. Your meal plan is processed quickly, and your daily deliveries will start from the very next day after your booking."],
  ["Refund Policy", "We want you to be completely satisfied. Refunds are allowed if a booking was made by mistake, or if your address falls outside our delivery radius.\n\nProcessing time typically takes 5 to 7 working days to reflect in your account."],
  ["Gym Supply", "We love supporting fitness communities! If you run a gym or fitness center, we offer bulk healthy meal supplies tailored for your members. Get in touch for our special bulk rates."],
[
  "Pause/Cancel Timing",
  "Plans change, and we get that! To avoid food wastage, please inform us at least one day in advance.\n\n• Lunch cancellation → notify us before 7:00 AM\n• Dinner cancellation → notify us before 12:00 PM"
],
  [
  "Subscription Pause While Traveling",
  "Heading out of town? No problem! You can pause your subscription while you're traveling. Monthly subscribers can skip up to 3 meals. The skipped meals will be carried forward, and your subscription will continue on the 1st, 2nd, and 3rd of the next month so you don't miss out on your meals."
],
  ["Subscription Uniqueness", "What makes ETATO special? We deliver homemade, chef-curated meals that are as nutritious as they are delicious. Our carefully rotating menu ensures you never get bored while effortlessly hitting your health goals!"],
];
const FEATURES_MARQUEE_ITEMS = [
  { label: "Veggies Diced Daily", icon: Salad },
  { label: "Reusable Bowls", icon: Soup },
  { label: "Homemade Dressings", icon: Droplet },
  { label: "Fresh-Prepped Salads", icon: LeafyGreen },
];
function ContactPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SUBJECT_MAP: Record<string, string> = {
    "General Enquiry": "GENERAL_ENQUIRY",
    "Subscription": "SUBSCRIPTION",
    "Bulk Order": "BULK_ORDER",
    "Feedback": "FEEDBACK",
    "Other": "OTHER",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          subject: SUBJECT_MAP[String(fd.get("subject"))] || "OTHER",
          message: fd.get("message"),
        }),
      });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-[#0A472E]">
        <div className="container mx-auto px-4 py-16 sm:py-20 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9D909] mb-3">
            Get in touch
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-white leading-tight">
            Say <span className="text-[#C9D909]">hello.</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-white/80 font-light">
            We usually reply on WhatsApp within a few hours during operating hours.
          </p>
        </div>
      </section>

      <Section bg="default">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="flex flex-col gap-4">
            <Tile icon={Phone} title="WhatsApp / Phone" body="+91 74999 34425" href="tel:+917499934425" />
            <Tile icon={Mail} title="Email" body="etatofoods@gmail.com" href="mailto:etatofoods@gmail.com" />
            <Tile icon={Instagram} title="Instagram" body="@etatofoods" href="https://instagram.com/etatofoods" />
            <Tile icon={MapPin} title="Address" body="Sr No. 135, Pooja Niwas, Flat 1006, Pune Satara Road, Near Katraj Dairy, Katraj, Pune – 411046" href="https://maps.app.goo.gl/9WxXVa8NAwYytdta6" />
            <Tile icon={Clock} title="Hours" body="Mon–Sat · Lunch 12–2:30 PM · Dinner 7–9:30 PM · Sunday OFF" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl p-6 sm:p-8 shadow-soft border border-border space-y-4"
          >
            {done ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-mint mx-auto flex items-center justify-center text-leaf">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-display text-2xl">Thank you!</h3>
                <p className="mt-2 text-sm text-muted-foreground">We'll get back to you on WhatsApp within a few hours.</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl">Send us a message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input name="name" required placeholder="Full Name *" className="contact-input" />
                  <input name="phone" required placeholder="Phone / WhatsApp *" type="tel" className="contact-input" />
                </div>
                <input name="email" required placeholder="Email *" type="email" className="contact-input" />
                <select name="subject" className="contact-input">
                  <option>General Enquiry</option>
                  <option>Subscription</option>
                  <option>Bulk Order</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
                <textarea name="message" required placeholder="Message *" minLength={10} className="contact-input min-h-[120px]" />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <button type="submit" disabled={loading} className="w-full px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </>
            )}
          </form>
        </div>
      </Section>


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


      <Section bg="mint">
        <SectionTitle eyebrow="Find us" title="Cloud kitchen · Katraj, Pune" />

        {/* Google Maps Embed */}
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-soft border border-border">
            <iframe
              title="Etato Foods — Katraj Dairy, Pune"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.708364656071!2d73.85266094264173!3d18.45154592664841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eb5f1ac3f04d%3A0xb25cc55b14f8dcf7!2sETATO%20Foods!5e0!3m2!1sen!2sin!4v1781718014885!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Delivery zone overlay badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-leaf/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-leaf" />
                </span>
                <div>
                  <p className="text-xs font-bold text-primary tracking-wide">DELIVERY ZONE</p>
                  <p className="text-[11px] text-muted-foreground">5–10 km radius from Katraj</p>
                </div>
              </div>
            </div>

            {/* Etato Foods marker label */}
            <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C9 6 6 7 4 8c0 8 4 12 8 12s8-4 8-12c-2-1-5-2-8-6Z" />
                <path d="M12 8v12" />
              </svg>
              <div>
                <p className="text-xs font-bold tracking-wide">ETATO FOODS</p>
                <p className="text-[10px] opacity-80">Cloud Kitchen · Katraj</p>
              </div>
            </div>
          </div>

          {/* Delivery areas info */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {["Katraj", "Sinhagad Road", "Dhayari", "Narhe", "Ambegaon", "Bibwewadi"].map((area) => (
              <span key={area} className="px-3 py-1.5 bg-white/70 rounded-full border border-leaf/15 text-charcoal/80 font-medium">
                {area}
              </span>
            ))}
          </div>

          {/* Get Directions CTA */}
          <div className="mt-6 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=18.451754560846926,73.85753719853014&travelmode=driving"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              <MapPin className="h-4 w-4" />
              Get Directions
            </a>
            <span className="text-xs text-muted-foreground">Opens in Google Maps · works on mobile</span>
          </div>
        </div>
      </Section>

      <section className="py-6 sm:py-12 relative overflow-hidden">
        {/* Background Image - Tiled to prevent resizing when accordion opens */}
        <div 
          className="absolute inset-0 z-0 opacity-100"
          style={{
            backgroundImage: `url(${faqbg})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '450px',
            backgroundPosition: 'top center'
          }}
        ></div>

        <div className="container mx-auto px-2 sm:px-4 lg:max-w-[1450px] relative z-10">
          <div className="bg-[#FFFDF6] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 lg:p-16 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              
              {/* Left Side: Title & Stamp */}
              <div className="lg:col-span-5 flex flex-col items-start">
                <h2 className="font-body text-[#0A472E] font-black uppercase text-4xl sm:text-5xl lg:text-[4rem] leading-[0.9] tracking-tighter">
                  FAQ<br />
                  Frequently<br />
                  Asked<br />
                  Questions
                </h2>
                <div className="w-full flex justify-center mt-12 lg:mt-16">
                  <img 
                    src={stamp} 
                    alt="Healthy Habits Stamp" 
                    className="w-56 sm:w-72 lg:w-[350px] opacity-100 -rotate-6 drop-shadow-md" 
                  />
                </div>
              </div>

              {/* Right Side: Accordions */}
              <div className="lg:col-span-7">
                <div className="flex flex-col">
                  {FAQ.map(([q, a]) => (
                    <details key={q} className="group py-5 border-b border-[#0A472E]/30 last:border-b-0 cursor-pointer">
                      <summary className="font-display text-[#0A472E] text-2xl sm:text-3xl list-none flex justify-between items-center gap-4 outline-none [&::-webkit-details-marker]:hidden">
                        {q}
                        <ArrowDown className="text-[#0A472E] w-5 h-5 transition-transform group-open:-rotate-180 shrink-0" />
                      </summary>
                      <div className="mt-4 text-[14px] sm:text-[15px] text-[#0A472E]/80 font-medium leading-relaxed whitespace-pre-wrap">
                        {a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .contact-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.85rem;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          font-size: 0.9rem;
          font-family: inherit;
          color: var(--color-foreground);
        }
        .contact-input:focus { outline: 2px solid var(--color-ring); outline-offset: 1px; }
      `}</style>
    </>
  );
}

function Tile({ icon: Icon, title, body, href }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; href?: string }) {
  const inner = (
    <div className="flex gap-4 items-start bg-card border border-border rounded-2xl p-5 hover:border-primary transition-colors">
      <div className="w-11 h-11 rounded-xl bg-mint flex items-center justify-center text-leaf shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">{title}</p>
        <p className="mt-1 text-sm text-charcoal leading-relaxed">{body}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block">{inner}</a> : inner;
}