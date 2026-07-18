import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Bowl } from "@/data/menu";
import { Placeholder } from "./Placeholder";
import { PhoneModal } from "./PhoneModal";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Plus, Check } from "lucide-react";

export function BowlCard({ bowl }: { bowl: Bowl }) {
  const disabled = bowl.comingSoon || bowl.notAvailable;
  const { user, isAuthenticated } = useAuth();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.find((i) => i.bowl.id === bowl.id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (!user?.phone) {
      setShowPhone(true);
      return;
    }
    addItem(bowl);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-[15px] border-2 border-[#C9D909] bg-[#0A472E] text-white shadow-[4px_6px_0px_0px_#C9D909] hover:shadow-[6px_8px_0px_0px_#C9D909] hover:-translate-y-0.5 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {bowl.image ? (
            <img
              src={bowl.image}
              alt={bowl.name}
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Placeholder ratio="square" label={bowl.name} />
          )}

          {/* Status badges */}
          {disabled && (
            <span className="absolute top-3 left-3 bg-[#0A472E]/90 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border border-white/20">
              {bowl.notAvailable ? "Out of Stock" : "Coming Soon"}
            </span>
          )}
          {bowl.jain && !disabled && (
            <span className="chip absolute top-3 left-3 text-[10px]">
              J · Jain Option
            </span>
          )}
          {bowl.price !== null && !bowl.notAvailable && (
            <span className="absolute top-3 right-3 bg-white text-[#0A472E] font-bold text-base px-3 py-1.5 rounded-[5px] shadow-sm">
              ₹{bowl.price}
            </span>
          )}

          {/* Hover quick-add (desktop) */}
          {!disabled && bowl.price !== null && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-[5px] bg-[#C9D909] text-[#0A472E] shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 sm:flex hidden font-bold"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Card body */}
        <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
          {/* Name */}
          <div className="flex items-start gap-2">
            <span className="veg-dot mt-1.5 shrink-0 border-[#C9D909]" style={{ borderColor: '#C9D909' }} aria-label="Pure Veg" />
            <h3 className="font-display text-lg sm:text-xl leading-snug uppercase tracking-tight text-white">
              {bowl.name}
            </h3>
          </div>

          {/* Dressing */}
          <p className="text-[#C9D909] font-bold text-xs tracking-[0.18em] uppercase">{bowl.dressing}</p>

          {/* Nutrition chips */}
          {!disabled && (
            <div className="flex flex-wrap gap-1.5">
              <span className="chip text-[11px]">{bowl.protein} Pro</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white">{bowl.calories} kcal</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white">{bowl.carbs} Carbs</span>
            </div>
          )}

          {/* Ingredients */}
          <p className="text-sm text-white/70 leading-relaxed flex-1 font-light">
            {bowl.ingredients.join(", ")}
          </p>

          {/* Add to Cart */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={disabled}
              className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 rounded-[5px] transition-all ${
                disabled
                  ? "bg-white/10 text-white/40 opacity-50 cursor-not-allowed h-12"
                  : justAdded
                    ? "bg-[#A8B80A] text-[#0A472E] scale-[0.97] h-12"
                    : inCart
                      ? "bg-white text-[#0A472E] border-2 border-white hover:bg-[#C9D909] hover:border-[#C9D909] active:scale-[0.97] h-12"
                      : "bg-[#C9D909] text-[#0A472E] hover:bg-[#D8E33A] active:scale-[0.97] h-12"
              }`}
            >
              {bowl.notAvailable ? (
                "Out of Stock"
              ) : bowl.comingSoon ? (
                "Coming Soon"
              ) : justAdded ? (
                <><Check className="h-4 w-4" /> Added!</>
              ) : inCart ? (
                <><Plus className="h-4 w-4" /> Add More · ₹{bowl.price}</>
              ) : (
                <><ShoppingBag className="h-4 w-4" /> Add to Cart · ₹{bowl.price}</>
              )}
            </button>
          </div>
        </div>
      </article>

      <PhoneModal
        open={showPhone}
        onClose={() => setShowPhone(false)}
        onSuccess={() => {
          setShowPhone(false);
          addItem(bowl);
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 1500);
        }}
      />
    </>
  );
}
