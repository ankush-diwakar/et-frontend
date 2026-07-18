import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Section, SectionTitle } from "@/components/etato/Section";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("LUNCH");
  const [dietaryPref, setDietaryPref] = useState("REGULAR_VEG");
  const [specialNotes, setSpecialNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      navigate({ to: "/menu" });
      return;
    }

    // Load addresses
    api<{ addresses: any[] }>("/user/addresses").then((res) => {
      setAddresses(res.addresses);
      const def = res.addresses.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (res.addresses.length > 0) setSelectedAddressId(res.addresses[0].id);
    }).catch(err => {
      toast.error("Failed to load addresses");
    });
  }, [items, navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const res = await api<{ orderId: string; orderNumber: string; razorpayOrderId: string; amount: number }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map(i => ({ menuItemId: i.bowl.id, quantity: i.quantity })),
          addressId: selectedAddressId,
          deliverySlot,
          dietaryPref,
          specialNotes,
          couponCode
        })
      });

      const resLoad = await loadRazorpay();
      if (!resLoad) {
        toast.error("Failed to load Razorpay SDK");
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res.amount,
        currency: "INR",
        name: "Etato Foods",
        description: `Order #${res.orderNumber}`,
        order_id: res.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: "#2D6A4F" }, // leaf green
        handler: async (response: any) => {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            await api("/orders/verify-payment", {
              method: "POST",
              body: JSON.stringify(response)
            });
            toast.success("Payment successful! You can track your order in the Profile tab.", { 
              id: "payment-verify",
              duration: 5000 
            });
            clearCart();
            navigate({ to: "/order-success" });
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed", { id: "payment-verify" });
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Failed to create order");
      setLoading(false);
    }
  };

  return (
    <Section bg="default" className="pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="font-display text-4xl text-primary mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-6 border border-border shadow-soft">
              <h2 className="font-display text-2xl mb-4">Delivery Address</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                  <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No addresses found.</p>
                  <button onClick={() => navigate({ to: "/profile" })} className="mt-3 text-primary text-sm font-semibold hover:underline">
                    Add Address in Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(a => (
                    <label key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === a.id ? 'border-primary bg-mint/20' : 'border-border hover:border-primary/50'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        className="mt-1 shrink-0 text-primary focus:ring-primary"
                        checked={selectedAddressId === a.id}
                        onChange={() => setSelectedAddressId(a.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold truncate">{a.label}</p>
                          {!a.isInZone && (
                            <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                              Out of Zone
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.fullAddress}</p>
                        <p className="text-sm text-muted-foreground">{a.pinCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-3xl p-6 border border-border shadow-soft">
              <h2 className="font-display text-2xl mb-4">Order Preferences</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5 block">Delivery Slot</span>
                  <select className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" value={deliverySlot} onChange={e => setDeliverySlot(e.target.value)}>
                    <option value="LUNCH">Lunch (12–2:30 PM)</option>
                    <option value="DINNER">Dinner (7–9:30 PM)</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5 block">Dietary Preference</span>
                  <select className="w-full p-2.5 rounded-xl border border-border bg-background text-sm" value={dietaryPref} onChange={e => setDietaryPref(e.target.value)}>
                    <option value="REGULAR_VEG">Regular Veg</option>
                    <option value="JAIN">Jain (No Onion/Garlic)</option>
                  </select>
                </label>
              </div>
              <label className="block mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/70 mb-1.5 block">Special Instructions</span>
                <textarea 
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-sm min-h-[80px]" 
                  placeholder="Any allergies or delivery instructions?"
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-card rounded-3xl p-6 border border-border shadow-soft sticky top-24">
              <h2 className="font-display text-2xl mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.bowl.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.bowl.name}</span>
                    <span className="font-medium">₹{(item.bowl.price ?? 0) * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-leaf font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-lg font-display pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-price">₹{totalPrice}</span>
                </div>
              </div>

              {selectedAddressId && addresses.find(a => a.id === selectedAddressId)?.isInZone === false && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>The selected address is outside our 10km delivery zone. Please select another address.</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || !selectedAddressId || addresses.find(a => a.id === selectedAddressId)?.isInZone === false}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-card"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ₹${totalPrice}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
