import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function AnimatedNumber({ end, suffix = "", prefix = "" }: { end: number, suffix?: string, prefix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const duration = 2000;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasAnimated, end]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

const BENEFITS = [
  { title: "Fresh Ingredients", desc: "Fresh vegetables sourced regularly for premium quality and freshness. Every leaf and veggie is hand-picked to ensure you get only the most nutritious and vibrant ingredients in every bite.", rotation: "-rotate-2" },
  { title: "High Protein", desc: "Built for fitness lovers, gym-goers and healthier lifestyles. Our macro-friendly meals are perfectly balanced to support muscle recovery and keep you energized all day long.", rotation: "rotate-2" },
  { title: "Flexible Subscriptions", desc: "Pause and redeem meals whenever required. Going out of town or having a busy week? Simply notify us to adjust your plan without any hassle or extra fees.", rotation: "-rotate-1" },
  { title: "Reliable Delivery", desc: "Fast and hygienic delivery across Katraj and nearby Pune. We make sure your healthy meals arrive fresh, safe, and right on time for your lunch or dinner.", rotation: "rotate-3" },
];

export function NotInsideFood() {
  return (
    <>
      <section className="bg-[#FFFDF6] py-16 sm:py-24 overflow-hidden relative">
        <div className="container mx-auto px-4 lg:max-w-[1400px]">
          <div className="text-center mb-16">
            <h2 className="font-display text-[#0A472E] text-3xl sm:text-4xl lg:text-[4rem] leading-[1.1] mb-6">
              Why Customers Love Our Salads ?
            </h2>
            <p className="mt-4 text-[#5a7060] font-medium text-[15px] sm:text-base max-w-2xl mx-auto leading-relaxed">
              Choosing the right salad is more than just a meal decision—it's about taste, health, and lifestyle. Here's why our salads stand out:
            </p>
          </div>

          {/* Premium Cards Grid */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-[1200px] mx-auto px-2">
            {BENEFITS.map((item, idx) => (
              <motion.div 
                key={idx} 
                className="h-full"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.15 }}
              >
                <div 
                  className={`w-[250px] lg:w-[260px] min-h-[400px] bg-[#0A472E] border-[3px] border-[#C9D909] rounded-[15px] p-6 sm:p-8 
                             flex flex-col shadow-[8px_8px_0_0_#C9D909]
                             ${item.rotation} hover:-translate-y-3 hover:rotate-0 transition-all duration-[400ms] ease-out cursor-default relative group h-full`}
                >
                  <h3 className="font-display text-white text-2xl sm:text-3xl tracking-wide mb-4 mt-2 leading-[1.2]">
                    {item.title}
                  </h3>
                  <p className="text-white/90 text-[14px] sm:text-[15px] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                  {/* Spiky numbered sticker matching the design */}
                  <div 
                    className="absolute -bottom-6 -left-6 w-16 h-16 bg-[#C9D909] text-[#0A472E] flex items-center justify-center font-black text-2xl shadow-[2px_2px_10px_rgba(0,0,0,0.2)] transform -rotate-12 group-hover:rotate-0 transition-transform z-10"
                    style={{
                      clipPath: "polygon(50% 0%, 61% 12%, 75% 5%, 80% 20%, 95% 20%, 93% 36%, 100% 50%, 93% 64%, 95% 80%, 80% 80%, 75% 95%, 61% 88%, 50% 100%, 39% 88%, 25% 95%, 20% 80%, 5% 80%, 7% 64%, 0% 50%, 7% 36%, 5% 20%, 20% 20%, 25% 5%, 39% 12%)"
                    }}
                  >
                    <span className="mt-1">{idx + 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-[#0A472E] border-y-2 border-[#C9D909] py-8 sm:py-12 relative z-20 shadow-xl">
        <div className="container mx-auto px-4 lg:max-w-[1400px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x-0 md:divide-x-2 divide-white/10">
            <div className="flex flex-col items-center justify-center">
              <div className="font-display text-4xl sm:text-5xl text-white mb-1">
                <AnimatedNumber end={22} suffix="–30g" />
              </div>
              <div className="text-[#C9D909] text-xs sm:text-sm font-bold uppercase tracking-wider">
                Protein Per Bowl
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="font-display text-4xl sm:text-5xl text-white mb-1">
                <AnimatedNumber end={100} suffix="%" />
              </div>
              <div className="text-[#C9D909] text-xs sm:text-sm font-bold uppercase tracking-wider">
                Fresh Ingredients
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="font-display text-4xl sm:text-5xl text-white mb-1">
                <AnimatedNumber end={10} suffix="+" />
              </div>
              <div className="text-[#C9D909] text-xs sm:text-sm font-bold uppercase tracking-wider">
                Signature Salads
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="font-display text-4xl sm:text-5xl text-white mb-1">
                <AnimatedNumber end={1} suffix="" />
              </div>
              <div className="text-[#C9D909] text-xs sm:text-sm font-bold uppercase tracking-wider">
                Mission: Healthy Pune
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
