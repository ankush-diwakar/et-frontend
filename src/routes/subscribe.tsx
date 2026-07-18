import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Section, SectionTitle } from "@/components/etato/Section";
import { api } from "@/lib/api";
import { Check, CalendarDays, Sparkles, RefreshCcw, ArrowDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { toast } from "sonner";
import faqbg from "@/assets/faqbg.webp";
import stamp from "@/assets/stamp.png";
import { ArrowRight, Leaf as LeafIcon, ShieldCheck, HandHeart, Dumbbell, HeartPulse, Loader2, Salad, Soup, Droplet, LeafyGreen } from "lucide-react";
interface ActiveSubscription {
  id: string;
  status: string; // ACTIVE | PAUSED | CANCELLED | COMPLETED
  planId: string;
  startDate: string;
  createdAt: string;
  deliverySlot: string;
  dietaryPref: string;
  bowlPreference?: string;
  specialNotes?: string;
  plan?: {
    name: string;
    durationDays: number;
    price: number;
  };
}

const FEATURES_MARQUEE_ITEMS = [
  { label: "Veggies Diced Daily", icon: Salad },
  { label: "Reusable Bowls", icon: Soup },
  { label: "Homemade Dressings", icon: Droplet },
  { label: "Fresh-Prepped Salads", icon: LeafyGreen },
];


const USPS = [
  { icon: LeafIcon, label: "Fresh Daily" },
  { icon: ShieldCheck, label: "100% Pure Veg" },
  { icon: HandHeart, label: "Jain Options" },
  { icon: Sparkles, label: "Hygienic Kitchen" },
  { icon: Dumbbell, label: "High Protein" },
  { icon: HeartPulse, label: "Healthy Lifestyle" },
];

export const Route = createFileRoute("/subscribe")({
  head: () => ({
    meta: [
      { title: "Subscribe — Etato Salad Plans · Save up to 20% in Pune" },
      {
        name: "description",
        content:
          "Weekly & monthly salad subscriptions delivered fresh in Katraj, Pune. Trial 3 days, weekly 6 days, monthly 26 days. Pause anytime.",
      },
    ],
  }),
  component: SubscribePage,
});

const PLAN_CONTENT: Record<string, any> = {
  weekly: {
    emoji: "🔥",
    bowlsCount: "6 High-Protein Bowls",
    includes: [
      "Daily rotating bowl menu",
      "Paneer & Pasta premium bowls included",
      "Skip 1 meal and redeem next Monday"
    ],
    best: "Working professionals, gym-goers and healthy eating beginners.",
    cta: "Choose Weekly Plan",
    theme: "bg-[#0A472E] text-white border-2 border-[#C9D909] hover:-translate-y-1 transition-all duration-300 shadow-[4px_6px_0px_0px_#C9D909]",
    badge: "Popular",
    titleColor: "text-white",
    iconColor: "text-[#C9D909]",
    dividerColor: "border-white/10",
  },
  monthly: {
    emoji: "👑",
    bowlsCount: "26 High-Protein Bowls",
    bonus: "🎁 First Month Bonus: Get 27 bowls for the price of 26 (1 FREE ETATO Protein Bowl worth ₹249)",
    includes: [
      "Daily rotating bowl menu",
      "Premium bowls included",
      "Skip up to 3 meals/month",
      "Redeem meals next month (Mon/Tue/Wed)"
    ],
    best: "Fitness-focused customers and long-term healthy eating.",
    cta: "Choose Monthly Plan",
    theme: "bg-white text-[#0A472E] border-2 border-[#d0ddd4] hover:-translate-y-1 hover:border-[#C9D909] hover:shadow-[4px_6px_0px_0px_#C9D909] transition-all duration-300 shadow-sm",
    badge: "Premium Membership",
    titleColor: "text-[#0A472E]",
    iconColor: "text-[#0A472E]",
    dividerColor: "border-[#0A472E]/10",
  }
};

const DEFAULT_PLANS = [
  {
    id: "weekly",
    t: "Weekly Plan",
    d: "6 days · Mon–Sat",
    o: 1494,
    p: 1419,
    save: "₹75",
    per: 236.5,
  },
  {
    id: "monthly",
    t: "Premium Monthly Membership",
    d: "26 days",
    o: 6474,
    p: 5699,
    save: "₹775",
    per: 219,
  },
];

const STEPS = [
  {
    n: "1",
    t: "Choose Your Plan",
    d: "Trial, Weekly or Monthly. Each bowl is ₹249; subscribing gives a discount.",
  },
  {
    n: "2",
    t: "Tell Us Your Bowl",
    d: "Pick your bowl(s), Jain or regular, address and time slot.",
  },
  { n: "3", t: "We Confirm", d: "Our team confirms via WhatsApp within a few hours." },
  {
    n: "4",
    t: "Fresh Daily",
    d: "Delivered at your slot — Lunch 12–2:30 PM or Dinner 7–9:30 PM, Mon–Sat.",
  },
  { n: "5", t: "Pause or Change", d: "Inform us 1 day in advance via WhatsApp — no meals lost." },
];

function SubscribePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [bowls, setBowls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [formData, setFormData] = useState({
    planId: "",
    deliverySlot: "LUNCH",
    dietaryPref: "REGULAR_VEG",
    bowlPreference: "",
    startDate: "",
    addressId: "",
    specialNotes: "",
  });

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Avoid injecting the script twice
      if ((window as any).Razorpay) return resolve(true);
      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate({ to: "/login", search: { redirect: "/subscribe" } });
      return;
    }
    if (!formData.planId) return toast.error("Please select a plan");
    setLoading(true);
    try {
      const { subscriptionId, razorpayOrderId, amount } = await api<any>("/subscriptions", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Helper: delete the PENDING subscription so user can retry cleanly
      const cancelPending = async () => {
        try {
          await api<any>(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
        } catch (_) {
          // Best-effort — ignore errors
        }
      };

      // Load Razorpay SDK before opening the modal
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        await cancelPending();
        toast.error("Failed to load Razorpay SDK. Check your internet connection.");
        setLoading(false);
        return;
      }

      const rzpOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "dummy",
        amount,
        currency: "INR",
        name: "Etato Subscriptions",
        description: "Subscription Order",
        order_id: razorpayOrderId,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#1B4332" },
        handler: async (response: any) => {
          try {
            await api<any>("/subscriptions/verify", {
              method: "POST",
              body: JSON.stringify(response),
            });
            toast.success("Subscription successful!");
            setSubmitted(true);
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            await cancelPending();
            toast.info("Payment cancelled. You can try again.");
          },
        },
      };
      const rzp = new (window as any).Razorpay(rzpOptions);
      // Also handle payment failure events
      rzp.on("payment.failed", async () => {
        await cancelPending();
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to create subscription");
      setLoading(false);
    }
  };

  useEffect(() => {
    api<{ items: any[] }>("/menu").then((data) => {
      setBowls(data.items.filter((i) => i.status !== "INACTIVE"));
    });
    api<{ plans: any[] }>("/subscriptions/plans").then((data) => {
      if (data.plans && data.plans.length > 0) {
        setPlans(data.plans.map(dp => ({
          id: dp.id,
          t: dp.name,
          d: `${dp.durationDays} days`,
          o: dp.originalPrice,
          p: dp.price,
          save: `₹${dp.originalPrice - dp.price}`,
          per: dp.perBowlPrice,
        })));
      }
    }).catch(console.error);
    if (isAuthenticated) {
      api<{ addresses: any[] }>("/user/addresses").then((res) => {
        setAddresses(res.addresses);
        if (res.addresses.length > 0) {
          const def = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          setFormData((prev) => ({ ...prev, addressId: def.id }));
        }
      });

      // Check for an existing active/paused subscription
      setLoadingSub(true);
      api<{ subscriptions: ActiveSubscription[] }>("/subscriptions")
        .then((res) => {
          const active = res.subscriptions?.find(
            (s) => s.status === "ACTIVE" || s.status === "PAUSED"
          );
          setActiveSub(active ?? null);
        })
        .catch(() => {})
        .finally(() => setLoadingSub(false));
    }
  }, [isAuthenticated]);

  return (
    <>
      <section className="bg-[#0A472E]">
        <div className="container mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9D909] mb-3">
            Salad Subscriptions
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-white leading-tight">
            Eat clean. <span className="font-script text-[#C9D909]">Save more.</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-white/70 font-light">
            Lock in your healthy week. Save up to 20% per bowl. Switch your bowl any time on
            WhatsApp.
          </p>
        </div>
      </section>

      <Section bg="default">
        <SectionTitle eyebrow="How it works" title="Simple, flexible, fresh" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((s, idx) => (
            <motion.div 
              key={s.n} 
              className="h-full"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
            >
              <div 
                className={`w-full h-full bg-[#0A472E] border-[3px] border-[#C9D909] rounded-[15px] p-5 sm:p-6 
                           flex flex-col shadow-[6px_6px_0_0_#C9D909]
                           ${idx % 2 === 0 ? 'rotate-2' : '-rotate-2'} hover:-translate-y-3 hover:rotate-0 transition-all duration-[400ms] ease-out cursor-default relative group`}
              >
                <h3 className="font-display text-white text-xl tracking-wide mb-3 leading-[1.2]">
                  {s.t}
                </h3>
                <p className="text-white/90 text-xs sm:text-[13px] leading-relaxed font-medium">
                  {s.d}
                </p>
                {/* Spiky numbered sticker matching the design */}
                <div 
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#C9D909] text-[#0A472E] flex items-center justify-center font-black text-xl shadow-[2px_2px_10px_rgba(0,0,0,0.2)] transform -rotate-12 group-hover:rotate-0 transition-transform z-10"
                  style={{
                    clipPath: "polygon(50% 0%, 61% 12%, 75% 5%, 80% 20%, 95% 20%, 93% 36%, 100% 50%, 93% 64%, 95% 80%, 80% 80%, 75% 95%, 61% 88%, 50% 100%, 39% 88%, 25% 95%, 20% 80%, 5% 80%, 7% 64%, 0% 50%, 7% 36%, 5% 20%, 20% 20%, 25% 5%, 39% 12%)"
                  }}
                >
                  <span className="mt-0.5">{s.n}</span>
                </div>
              </div>
            </motion.div>
          ))}
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

      <Section bg="default">
        <SectionTitle eyebrow="Pricing" title="Pick your plan" />
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {plans.map((p, idx) => {
            const content = PLAN_CONTENT[p.id];
            if (!content) return null;
            return (
              <motion.div
                key={p.id}
                className={`relative rounded-[15px] p-5 sm:p-6 flex flex-col h-full ${content.theme}`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
              >
                {content.badge && (
                  <span className="chip absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] bg-[#C9D909] text-[#0A472E] px-3 py-0.5 font-bold rounded-full border border-[#0A472E]">
                    {content.badge}
                  </span>
                )}
                
                <div className="mb-3">
                  <span className="text-2xl mr-2 inline-block align-middle">{content.emoji}</span>
                  <h3 className={`font-display text-xl inline-block align-middle ${content.titleColor}`}>{p.t}</h3>
                  <p className="opacity-80 text-xs mt-1">{content.bowlsCount}</p>
                </div>

                <div className={`mb-4 pb-4 border-b ${content.dividerColor}`}>
                  <div className="flex items-end gap-2">
                    <p className="text-xs line-through opacity-60 mb-0.5">₹{p.o}</p>
                    <p className="font-display text-3xl">₹{p.p}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-[#C9D909] text-[#0A472E] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Save {p.save}</span>
                    <span className="text-xs opacity-80">Approx. ₹{p.per}/bowl</span>
                  </div>
                </div>

                {content.bonus && (
                  <div className="bg-[#C9D909] text-[#0A472E] p-2.5 rounded-lg text-xs font-semibold mb-4 leading-snug shadow-sm">
                    {content.bonus}
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-2">Includes</p>
                  <ul className="space-y-1.5 mb-4">
                    {content.includes.map((inc: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <Check className={`h-3 w-3 shrink-0 mt-0.5 ${content.iconColor}`} />
                        <span className="opacity-90 leading-relaxed">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`mt-auto pt-4 border-t ${content.dividerColor}`}>
                  <p className="text-[11px] italic opacity-80 leading-relaxed">
                    <span className="font-bold mr-1 not-italic">Best For:</span> {content.best}
                  </p>
                </div>
              </motion.div>
            );
          })}
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


      <Section bg="default">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left sidebar — always shown */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#0A472E] mb-3">
              {activeSub ? "Your Subscription" : "Subscribe"}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#0A472E]">
              {activeSub ? "Plan is live 🌿" : "Start your plan"}
            </h2>
            <p className="mt-4 text-sm text-[#5a7060] font-light">
              {activeSub
                ? "Your subscription is active and deliveries are running as scheduled."
                : "Fill the form and we'll confirm your subscription on WhatsApp within a few hours."}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              {[
                "Mon–Sat delivery, Sunday off",
                "Pause anytime with 1 day notice",
                "Jain version on every bowl",
                "Pay upfront for the chosen plan",
              ].map((x) => (
                <p key={x} className="flex items-center gap-2 text-[#0A472E] font-medium">
                  <Check className="h-4 w-4 text-[#C9D909]" /> {x}
                </p>
              ))}
            </div>
          </div>

          {/* Right panel — loading / active plan card / form */}
          <div className="lg:col-span-3">
            {loadingSub ? (
              /* Loading state */
              <div className="bg-white rounded-[15px] p-10 border-2 border-[#d0ddd4] flex flex-col items-center justify-center gap-4 min-h-[260px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#0A472E]" />
                <p className="text-sm text-[#5a7060]">Checking your subscription…</p>
              </div>

            ) : activeSub ? (
              /* ── Active Plan Card ─────────────────────────── */
              <div className="bg-white rounded-[15px] border-2 border-[#C9D909] shadow-[4px_6px_0px_0px_#C9D909] overflow-hidden">
                {/* Header strip */}
                <div className="bg-[#0A472E] px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[15px] bg-[#C9D909] flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#0A472E]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Active Subscription</p>
                      <p className="font-display text-xl text-white">
                        {activeSub.plan?.name ??
                          (plans.find((p) => p.id === activeSub.planId)?.t ?? "Subscription Plan")}
                      </p>
                    </div>
                  </div>
                  <span className={`chip text-[10px] ${
                    activeSub.status === "ACTIVE"
                      ? "bg-[#C9D909] text-[#0A472E]"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {activeSub.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="p-6 grid sm:grid-cols-2 gap-4">
                  <PlanDetail
                    icon={<CalendarDays className="h-4 w-4 text-[#0A472E]" />}
                    label="Start Date"
                    value={new Date(activeSub.startDate).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  />
                  <PlanDetail
                    icon={<CalendarDays className="h-4 w-4 text-[#0A472E]" />}
                    label="Subscribed On"
                    value={new Date(activeSub.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  />
                  <PlanDetail
                    icon={<Check className="h-4 w-4 text-[#0A472E]" />}
                    label="Delivery Slot"
                    value={activeSub.deliverySlot === "LUNCH" ? "Lunch (12–2:30 PM)" : "Dinner (7–9:30 PM)"}
                  />
                  <PlanDetail
                    icon={<Check className="h-4 w-4 text-[#0A472E]" />}
                    label="Dietary Preference"
                    value={activeSub.dietaryPref === "JAIN" ? "Jain (No Onion-Garlic)" : "Regular Veg"}
                  />
                  {activeSub.bowlPreference && (
                    <PlanDetail
                      icon={<Check className="h-4 w-4 text-[#0A472E]" />}
                      label="Bowl Preference"
                      value={activeSub.bowlPreference}
                    />
                  )}
                  {activeSub.plan?.durationDays && (
                    <PlanDetail
                      icon={<RefreshCcw className="h-4 w-4 text-[#0A472E]" />}
                      label="Duration"
                      value={`${activeSub.plan.durationDays} days`}
                    />
                  )}
                </div>

                {/* Footer actions */}
                <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/917499934425?text=Hi%2C%20I%20want%20to%20manage%20my%20subscription"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex-1 text-center"
                  >
                    Pause / Change on WhatsApp
                  </a>
                  <Link
                    to="/profile"
                    className="btn-primary flex-1 text-center"
                  >
                    View in Profile →
                  </Link>
                </div>

                <div className="px-6 pb-5">
                  <p className="text-[11px] text-[#5a7060] text-center">
                    To pause or cancel, message us on WhatsApp at least 1 day in advance.
                  </p>
                </div>
              </div>

            ) : (
              /* ── Subscription Form ────────────────────────── */

              <form
                className="bg-white rounded-[15px] p-6 sm:p-8 border-2 border-[#d0ddd4] space-y-4"
                onSubmit={handleSubmit}
              >
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-[15px] bg-[#C9D909] mx-auto flex items-center justify-center">
                      <Check className="h-7 w-7 text-[#0A472E]" />
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-[#0A472E]">Thanks!</h3>
                    <p className="mt-2 text-sm text-[#5a7060] font-light">
                      We'll WhatsApp you within a few hours to confirm your plan.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Full Name *">
                        <input required className="input" type="text" readOnly defaultValue={user?.name || ""} />
                      </Field>
                      <Field label="Phone / WhatsApp *">
                        <input required className="input" type="tel" readOnly defaultValue={user?.phone || ""} />
                      </Field>
                    </div>
                    <Field label="Email *">
                      <input required className="input" type="email" readOnly defaultValue={user?.email || ""} />
                    </Field>

                    <Field label="Plan *">
                      <div className="grid grid-cols-2 gap-3">
                        {plans.map((p) => (
                          <label
                            key={p.id}
                            className="border-2 border-[#d0ddd4] rounded-[10px] p-4 cursor-pointer has-[:checked]:bg-[#f0f5d0] has-[:checked]:border-[#C9D909] transition-colors"
                          >
                            <input
                              type="radio"
                              name="plan"
                              value={p.id}
                              checked={formData.planId === p.id}
                              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                              className="sr-only"
                            />
                            <p className="font-display text-lg text-[#0A472E]">{p.t}</p>
                            <p className="text-[#5a7060] font-medium mt-1">₹{p.p}</p>
                          </label>
                        ))}
                      </div>
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Bowl Preference">
                        <select
                          className="input"
                          value={formData.bowlPreference}
                          onChange={(e) => setFormData({ ...formData, bowlPreference: e.target.value })}
                        >
                          <option value="">Surprise me</option>
                          {bowls
                            .filter((b) => b.status !== "COMING_SOON")
                            .map((b) => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                      </Field>
                      <Field label="Dietary Preference">
                        <select
                          className="input"
                          value={formData.dietaryPref}
                          onChange={(e) => setFormData({ ...formData, dietaryPref: e.target.value })}
                        >
                          <option value="REGULAR_VEG">Regular Veg</option>
                          <option value="JAIN">Jain (no onion-garlic)</option>
                        </select>
                      </Field>
                      <Field label="Delivery Slot">
                        <select
                          className="input"
                          value={formData.deliverySlot}
                          onChange={(e) => setFormData({ ...formData, deliverySlot: e.target.value })}
                        >
                          <option value="LUNCH">Lunch (12–2:30 PM)</option>
                          <option value="DINNER">Dinner (7–9:30 PM)</option>
                        </select>
                      </Field>
                      <Field label="Start Date *">
                        <input
                          required
                          className="input"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </Field>
                    </div>

                    <Field label="Delivery Address *">
                      {addresses.length === 0 ? (
                        <div className="input text-sm text-muted-foreground py-3 bg-muted/30">
                          No addresses found. <a href="/profile" className="text-leaf underline font-semibold ml-1">Add one in your profile</a>
                        </div>
                      ) : (
                        <select
                          required
                          className="input"
                          value={formData.addressId}
                          onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}
                        >
                          <option value="" disabled>Select an address</option>
                          {addresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label} - {addr.fullAddress} (PIN: {addr.pinCode})
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    <Field label="Special Instructions">
                      <textarea
                        className="input min-h-[60px]"
                        value={formData.specialNotes}
                        onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full mt-2"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {loading ? "Processing…" : "Subscribe & Pay"}
                    </button>
                  </>
                )}
              </form>
            )}
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
                  {[
                    [
                      "Can I change my bowl during the week?",
                      "Yes! WhatsApp us at +91 74999 34425 at least 1 day before your delivery.",
                    ],
                    [
                      "What if I'm not at home one day?",
                      "Inform us 1 day in advance — we'll push that day's bowl to later. No meal lost.",
                    ],
                    [
                      "Is Sunday delivery available?",
                      "No — Etato is off on Sundays. Our week runs Monday to Saturday.",
                    ],
                    [
                      "Can I get a Jain version?",
                      "Yes! Select 'Jain' in the form. No onion, no garlic, root veg substituted.",
                    ],
                    [
                      "Do I pay in advance?",
                      "Yes — subscription payment is collected upfront for the full week or month.",
                    ],
                    [
                      "What is the delivery area?",
                      "5–10 km from Katraj Dairy, Pune. Confirm your PIN at sign-up.",
                    ],
                  ].map(([q, a]) => (
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


    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-[#0A472E]/70">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function PlanDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-[5px] bg-[#f0f5d0] border border-[#C9D909]/40">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0A472E]/60">{label}</p>
        <p className="text-sm font-bold text-[#0A472E] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

