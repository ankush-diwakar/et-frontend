import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Leaf } from "lucide-react";

export function CartPanel() {
  const { items, totalItems, totalPrice, isOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    // Navigate to Phase 3 checkout page
    navigate({ to: "/checkout" });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in border-l-2 border-[#C9D909]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#d0ddd4] bg-[#0A472E]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#C9D909]" />
            <h2 className="font-display text-xl text-white">Your Cart</h2>
            {totalItems > 0 && (
              <span className="chip text-xs">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-[5px] hover:bg-white/10 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-[15px] bg-[#f0f5d0] border-2 border-[#C9D909] flex items-center justify-center mb-5">
              <Leaf className="h-8 w-8 text-[#0A472E]" />
            </div>
            <h3 className="font-display text-xl text-[#0A472E]">Cart is empty</h3>
            <p className="mt-2 text-sm text-[#5a7060] leading-relaxed font-light">
              Explore our menu and add some delicious protein bowls!
            </p>
            <Link
              to="/menu"
              onClick={closeCart}
              className="btn-primary mt-6 inline-flex"
            >
              Browse Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.bowl.id}
                  className="flex gap-3 p-3 bg-[#FFFDF6] rounded-[15px] border-2 border-[#d0ddd4]"
                >
                  {/* Image */}
                  {item.bowl.image ? (
                    <img
                      src={item.bowl.image}
                      alt={item.bowl.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-mint flex items-center justify-center shrink-0">
                      <Leaf className="h-6 w-6 text-leaf" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-display text-sm sm:text-base leading-tight text-[#0A472E] truncate">
                          {item.bowl.name}
                        </h4>
                        <p className="text-[11px] text-[#C9D909] font-bold tracking-wider uppercase mt-0.5" style={{color: '#A8B80A'}}>
                          {item.bowl.dressing}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.bowl.id)}
                        className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-0 border border-border rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.bowl.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-mint transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.bowl.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-mint transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-sm font-bold text-price">
                        ₹{(item.bowl.price ?? 0) * item.quantity}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1 mt-2">
                      {item.bowl.jain && (
                        <span className="chip text-[9px] px-1.5 py-0.5">Jain</span>
                      )}
                      <span className="chip text-[9px] px-1.5 py-0.5">
                        {item.bowl.protein} Pro
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-card px-5 py-4 space-y-3">
              {/* Summary */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-leaf font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-base font-display pt-1.5 border-t border-border">
                  <span>Total</span>
                  <span className="text-price text-lg">₹{totalPrice}</span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleCheckout}
                className="btn-primary w-full"
              >
                {isAuthenticated ? (
                  <>
                    Proceed to Checkout · ₹{totalPrice}
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>Login to Order</>
                )}
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
