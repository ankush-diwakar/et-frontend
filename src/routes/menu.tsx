import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Section } from "@/components/etato/Section";
import { BowlCard } from "@/components/etato/BowlCard";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Etato Foods · Protein Salad Bowls Katraj, Pune" },
      { name: "description", content: "Browse our full menu of fresh, high-protein veg salad bowls. Paneer, sprout & chickpea bowls. Jain options available." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<string>("All");

  useEffect(() => {
    Promise.all([
      api<{ items: any[] }>("/menu"),
      api<{ categories: any[] }>("/menu/categories"),
    ])
      .then(([itemData, catData]) => {
        // filter out inactive items completely
        setItems(itemData.items.filter(i => i.status !== "INACTIVE"));
        setCategories(catData.categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#0A472E]" /></div>;
  }
  
  if (error) {
    return <div className="text-center py-32 text-destructive">{error}</div>;
  }

  const tabs = ["All", ...categories.map(c => c.name)];
  const list = tab === "All" ? items : items.filter((b) => b.category?.name === tab);

  return (
    <>
      <section className="bg-[#0A472E] border-b-2 border-[#C9D909]">
        <div className="container mx-auto px-4 py-14 sm:py-20 text-center">
          <p className="font-bold text-[#C9D909] text-xs tracking-[0.25em] uppercase mb-3">Fresh Daily</p>
          <h1 className="font-display text-4xl sm:text-6xl text-white leading-tight">Salad Menu</h1>
          <p className="mt-4 max-w-xl mx-auto text-white/70 font-light">
            Fresh bowls crafted daily. <strong className="text-[#C9D909] font-bold">100% Pure Vegetarian.</strong> Jain options available. Katraj, Pune.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 bg-[#FFFDF6]/90 backdrop-blur border-b-2 border-[#d0ddd4]">
        <div className="container mx-auto px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-bold rounded-[5px] transition-colors ${
                  tab === t
                    ? "bg-[#0A472E] text-white"
                    : "bg-white border-2 border-[#d0ddd4] text-[#0A472E] hover:border-[#0A472E]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Section bg="default">
        {categories
          .filter((cat) => list.some((b) => b.categoryId === cat.id))
          .map((cat) => (
            <div key={cat.id} className="mb-14 last:mb-0">
              <h2 className="font-display text-2xl sm:text-3xl text-[#0A472E] mb-6 flex items-center gap-3">
                {cat.name} <span className="h-0.5 bg-[#C9D909] flex-1 ml-4 rounded-full" />
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list
                  .filter((bowl) => bowl.categoryId === cat.id)
                  .map((bowl, idx) => (
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
            </div>
          ))}

        {list.length === 0 && (
          <div className="text-center py-20 text-[#5a7060] border-2 border-dashed border-[#d0ddd4] rounded-[15px]">
            No items available in this category.
          </div>
        )}
      </Section>
    </>
  );
}
