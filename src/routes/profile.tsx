import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Section } from "@/components/etato/Section";
import { PhoneModal } from "@/components/etato/PhoneModal";
import { User, Phone, MapPin, Plus, Trash2, Check, ArrowRight, Loader2, Navigation, ShoppingBag, CalendarDays, Sparkles, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Etato Foods" },
      { name: "description", content: "Manage your Etato Foods profile, phone number, and delivery addresses." },
    ],
  }),
  component: ProfilePage,
});

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  pinCode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  isInZone: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    quantity: number;
    menuItem: { name: string };
  }[];
  payment?: {
    status: string;
  };
}

interface Subscription {
  id: string;
  status: string;
  planId: string;
  startDate: string;
  createdAt: string;
  deliverySlot: string;
  dietaryPref: string;
  bowlPreference?: string;
  plan?: { name: string; durationDays: number; price: number };
}

function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showPhone, setShowPhone] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState<'Upcoming' | 'Success' | 'Failed'>('Upcoming');
  const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>(undefined); // undefined = loading
  const [activeTab, setActiveTab] = useState<'Orders' | 'Subscription'>('Orders');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      api<{ addresses: Address[] }>("/user/addresses")
        .then((d) => setAddresses(d.addresses))
        .catch(() => {})
        .finally(() => setLoadingAddr(false));

      api<{ orders: Order[] }>("/orders")
        .then((d) => setOrders(d.orders))
        .catch(() => {})
        .finally(() => setLoadingOrders(false));

      api<{ subscriptions: Subscription[] }>("/subscriptions")
        .then((res) => {
          setSubscriptions(res.subscriptions || []);
        })
        .catch(() => setSubscriptions([]));
    }
  }, [isAuthenticated]);

  const getFilteredOrders = () => {
    switch (orderFilter) {
      case 'Upcoming':
        // Paid (CAPTURED) AND not yet delivered/cancelled
        return orders.filter(o => o.payment?.status === 'CAPTURED' && !['DELIVERED', 'CANCELLED'].includes(o.status));
      case 'Success':
        // All paid (CAPTURED) orders
        return orders.filter(o => o.payment?.status === 'CAPTURED');
      case 'Failed':
        // All non-captured payments (PENDING or FAILED)
        return orders.filter(o => o.payment?.status !== 'CAPTURED');
      default:
        return orders;
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-[#0A472E]">
        <div className="container mx-auto px-4 py-14 sm:py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#C9D909] text-[#0A472E] mx-auto flex items-center justify-center text-3xl font-display font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl text-white">{user.name}</h1>
          <p className="mt-1 text-sm text-white/70">{user.email}</p>
        </div>
      </section>

      <Section bg="default">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Personal Info & Addresses */}
            <div className="lg:col-span-1 space-y-8">
              {/* ─── Personal Info ─────────────── */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-soft">
                <h2 className="font-display text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-leaf" /> Personal Info
                </h2>
                <div className="mt-5 space-y-4">
                  <InfoRow label="Name" value={user.name} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow
                    label="Phone"
                    value={user.phone || "Not added yet"}
                    action={
                      <button
                        onClick={() => setShowPhone(true)}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        {user.phone ? "Change" : "Add Phone"}
                      </button>
                    }
                    muted={!user.phone}
                  />
                  <InfoRow label="Member Since" value={new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
                </div>
              </div>

              {/* ─── Delivery Addresses ─────────── */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-leaf" /> Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddrForm(true)}
                    className="text-xs px-3 py-1.5 rounded-full bg-mint text-leaf font-semibold hover:bg-leaf/20 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>

                {loadingAddr ? (
                  <div className="mt-6 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">No addresses saved yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onDelete={async () => {
                          await api(`/user/address/${addr.id}`, { method: "DELETE" });
                          setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
                        }}
                        onZoneUpdated={(updated) => {
                          setAddresses((prev) => prev.map((a) => a.id === updated.id ? updated : a));
                        }}
                      />
                    ))}
                  </div>
                )}

                {showAddrForm && (
                  <AddressFormInline
                    onClose={() => setShowAddrForm(false)}
                    onSaved={(addr) => {
                      setAddresses((prev) => [addr, ...prev]);
                      setShowAddrForm(false);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Orders & Subscription Tabs */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card rounded-3xl border border-border shadow-soft h-full flex flex-col overflow-hidden">
                {/* ─── Tabs Header ─────────────────── */}
                <div className="flex items-center border-b border-border bg-muted/20">
                  <button
                    onClick={() => setActiveTab('Orders')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-display text-lg border-b-2 transition-colors ${
                      activeTab === 'Orders' ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" /> My Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('Subscription')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-display text-lg border-b-2 transition-colors ${
                      activeTab === 'Subscription' ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <Sparkles className="h-5 w-5" /> Subscription
                  </button>
                </div>

                {/* ─── Tab Content ─────────────────── */}
                <div className="p-6 flex-1 flex flex-col">
                  {activeTab === 'Orders' ? (
                    /* ─── My Orders ─────────────────── */
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <p className="text-sm text-muted-foreground">Recent orders & history</p>
                        
                        {/* Filter Tabs */}
                        {!loadingOrders && orders.length > 0 && (
                          <div className="flex p-1 bg-mint/30 rounded-xl border border-leaf/10">
                            {(['Upcoming', 'Success', 'Failed'] as const).map(f => (
                              <button
                                key={f}
                                onClick={() => setOrderFilter(f)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                  orderFilter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-primary'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {loadingOrders ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20">
                          <Loader2 className="h-10 w-10 animate-spin text-[#1B412B] opacity-20" />
                          <p className="mt-4 text-sm text-muted-foreground">Fetching your orders...</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-mint/10 rounded-3xl border-2 border-dashed border-leaf/20">
                          <ShoppingBag className="h-12 w-12 text-leaf/30 mb-4" />
                          <p className="text-muted-foreground font-medium">You haven't placed any orders yet.</p>
                          <Link to="/menu" className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90">
                            Browse Menu
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar flex-1">
                          {getFilteredOrders().map((order) => (
                            <div key={order.id} className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all group">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                                <div>
                                  <p className="text-[10px] font-bold text-leaf uppercase tracking-widest">{order.orderNumber}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                  {order.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                              
                              <div className="space-y-1 border-t border-border/50 pt-3 mb-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[13px]">
                                    <span className="text-charcoal font-medium">{item.quantity}x {item.menuItem.name}</span>
                                    <span className="h-px bg-border/20 flex-1 mx-3" />
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between items-center border-t border-border/50 pt-3">
                                <div className="flex items-center gap-2">
                                  <div className={`h-1.5 w-1.5 rounded-full ${getPaymentStatusInfo(order.payment?.status).dotColor}`} />
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusInfo(order.payment?.status).textColor}`}>
                                    {getPaymentStatusInfo(order.payment?.status).label}
                                  </span>
                                </div>
                                <p className="text-base font-display text-primary">₹{order.total}</p>
                              </div>
                            </div>
                          ))}
                          {getFilteredOrders().length === 0 && (
                            <div className="py-10 text-center">
                              <p className="text-xs text-muted-foreground italic">No orders found in this category.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* ─── My Subscription ──────────── */
                    <>
                      {subscriptions === undefined ? (
                        /* Loading */
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <Loader2 className="h-8 w-8 animate-spin text-[#1B412B] opacity-20" />
                          <p className="mt-4 text-sm">Loading subscriptions...</p>
                        </div>

                      ) : subscriptions.length === 0 ? (
                        /* No subscriptions */
                        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-mint/10 rounded-3xl border-2 border-dashed border-leaf/20">
                          <Sparkles className="h-12 w-12 text-leaf/30 mb-4" />
                          <p className="text-muted-foreground font-medium">No subscriptions yet.</p>
                          <Link
                            to="/subscribe"
                            className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                          >
                            View Plans
                          </Link>
                        </div>

                      ) : (
                        /* List of subscriptions */
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar flex-1">
                          {subscriptions.map((sub) => (
                            <div key={sub.id} className="space-y-3 p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
                              {/* Plan header */}
                              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50">Plan</p>
                                  <p className="font-display text-lg text-primary mt-0.5">
                                    {sub.plan?.name ?? sub.planId}
                                  </p>
                                </div>
                                <span className={`text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                  sub.status === "ACTIVE"
                                    ? "bg-mint text-leaf"
                                    : sub.status === "EXPIRED" || sub.status === "CANCELLED" || sub.status === "COMPLETED"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {sub.status}
                                </span>
                              </div>

                              {/* Detail rows */}
                              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                                <SubInfoRow icon={<CalendarDays className="h-3.5 w-3.5 text-leaf" />} label="Subscribed" value={new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                                <SubInfoRow icon={<CalendarDays className="h-3.5 w-3.5 text-leaf" />} label="Starts" value={new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                                <SubInfoRow icon={<CalendarDays className="h-3.5 w-3.5 text-leaf opacity-50" />} label="Ends" value={sub.plan?.durationDays ? new Date(new Date(sub.startDate).getTime() + (sub.plan.durationDays * 24 * 60 * 60 * 1000)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"} />
                                <SubInfoRow icon={<Check className="h-3.5 w-3.5 text-leaf" />} label="Slot" value={sub.deliverySlot === "LUNCH" ? "Lunch" : "Dinner"} />
                                <SubInfoRow icon={<Check className="h-3.5 w-3.5 text-leaf" />} label="Diet" value={sub.dietaryPref === "JAIN" ? "Jain" : "Regular Veg"} />
                                {sub.bowlPreference && (
                                  <SubInfoRow icon={<RefreshCcw className="h-3.5 w-3.5 text-leaf" />} label="Pref" value={sub.bowlPreference} />
                                )}
                              </div>
                              
                              {(sub.status === "ACTIVE" || sub.status === "PAUSED") && (
                                <a
                                  href="https://wa.me/917499934425?text=Hi%2C%20I%20want%20to%20manage%20my%20subscription"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-leaf/30 bg-mint/20 text-leaf text-xs font-bold hover:bg-mint transition-colors"
                                >
                                  Manage on WhatsApp
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
            </div>
          </div>
        </div>

          {/* ─── Quick Links ─────────────── */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <QuickLink to="/menu" label="Browse Menu" desc="Order your favourite bowl" />
            <QuickLink to="/subscribe" label="Subscription Plans" desc="Save up to 20% per bowl" />
          </div>
        </div>
      </Section>

      <PhoneModal
        open={showPhone}
        onClose={() => setShowPhone(false)}
        onSuccess={refreshUser}
      />
    </>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */

function InfoRow({ label, value, action, muted }: { label: string; value: string; action?: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">{label}</p>
        <p className={`text-sm mt-0.5 ${muted ? "text-muted-foreground italic" : ""}`}>{value}</p>
      </div>
      {action}
    </div>
  );
}

function AddressCard({ address, onDelete, onZoneUpdated }: { address: Address; onDelete: () => void; onZoneUpdated: (updated: Address) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const [recheckMsg, setRecheckMsg] = useState("");

  const handleRecheck = async () => {
    setRechecking(true);
    setRecheckMsg("");
    try {
      const data = await api<{ address: Address; isInZone: boolean; distanceKm: number }>(`/user/address/${address.id}/recheck-zone`, { method: "PATCH" });
      onZoneUpdated(data.address);
      setRecheckMsg(data.isInZone
        ? `\u2713 In zone (${data.distanceKm} km from kitchen)`
        : `\u2717 Still out of zone (${data.distanceKm} km). We deliver within 10 km.`
      );
    } catch (err: any) {
      setRecheckMsg(err.message || "Could not recheck zone.");
    } finally {
      setRechecking(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-background border border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-leaf">{address.label}</span>
          {address.isDefault && <span className="text-[10px] bg-mint text-leaf px-2 py-0.5 rounded-full font-semibold">Default</span>}
          {address.isInZone ? (
            <span className="text-[10px] bg-mint text-leaf px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
              <Check className="h-3 w-3" /> In Zone
            </span>
          ) : (
            <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">Out of Zone</span>
          )}
        </div>
        <p className="text-sm mt-1 text-charcoal/80 leading-relaxed">{address.fullAddress}</p>
        <p className="text-xs text-muted-foreground mt-0.5">PIN: {address.pinCode}</p>
        {!address.isInZone && (
          <button
            onClick={handleRecheck}
            disabled={rechecking}
            className="mt-2 text-xs text-primary underline hover:no-underline disabled:opacity-50"
          >
            {rechecking ? "Rechecking..." : "Recheck delivery zone"}
          </button>
        )}
        {recheckMsg && (
          <p className={`text-xs mt-1 ${recheckMsg.startsWith("\u2713") ? "text-leaf" : "text-destructive"}`}>{recheckMsg}</p>
        )}
      </div>
      <button
        onClick={async () => { setDeleting(true); await onDelete(); }}
        disabled={deleting}
        className="p-2 rounded-full hover:bg-destructive/10 text-destructive/60 hover:text-destructive shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddressFormInline({ onClose, onSaved }: { onClose: () => void; onSaved: (addr: Address) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [geoError, setGeoError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Auto-detect on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Your browser doesn't support geolocation.");
      return;
    }
    setGeoStatus("loading");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("done");
      },
      (err) => {
        setGeoStatus("error");
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Location access was denied. Please allow it in your browser settings and try again.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Location unavailable. Please check your GPS/network.");
            break;
          case err.TIMEOUT:
            setGeoError("Location request timed out. Please try again.");
            break;
          default:
            setGeoError("Could not get location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!coords) {
      // Try one more time
      detectLocation();
      setError("Still detecting your location... please wait a moment and try again.");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const data = await api<{ address: Address; isInZone: boolean; distanceKm: number | null }>("/user/address", {
        method: "POST",
        body: JSON.stringify({
          label: fd.get("label") || "Home",
          fullAddress: fd.get("fullAddress"),
          pinCode: fd.get("pinCode"),
          latitude: coords.lat,
          longitude: coords.lng,
        }),
      });
      setDistanceKm(data.distanceKm);
      if (!data.isInZone) {
        setError(`⚠️ This address is ${data.distanceKm} km from our kitchen. We deliver within 10 km of Katraj, Pune. The address has been saved but cannot be used for ordering.`);
        onSaved(data.address);
        return;
      }
      onSaved(data.address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 p-5 bg-mint/50 rounded-2xl space-y-3 border border-leaf/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New Address</h3>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-destructive">Cancel</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <select name="label" className="addr-input">
          <option>Home</option>
          <option>Work</option>
          <option>Other</option>
        </select>
        <input name="pinCode" required placeholder="PIN Code *" pattern="\d{6}" className="addr-input" />
      </div>
      <textarea name="fullAddress" required placeholder="Full address with landmark *" minLength={10} className="addr-input min-h-[70px]" />

      {/* Location Detection */}
      <div className={`p-3 rounded-xl border ${geoStatus === "done" ? "bg-mint/30 border-leaf/30" : geoStatus === "error" ? "bg-destructive/5 border-destructive/30" : "bg-background border-border"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Navigation className={`h-3.5 w-3.5 shrink-0 ${geoStatus === "done" ? "text-leaf" : geoStatus === "loading" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span className={`text-xs font-semibold ${geoStatus === "done" ? "text-leaf" : geoStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}>
              {geoStatus === "loading" && "Detecting your location..."}
              {geoStatus === "done" && "Location detected \u2713"}
              {geoStatus === "error" && "Location detection failed"}
              {geoStatus === "idle" && "Detecting location..."}
            </span>
          </div>
          {(geoStatus === "error" || geoStatus === "idle") && (
            <button
              type="button"
              onClick={detectLocation}
              className="text-xs px-3 py-1 rounded-full border border-leaf text-leaf font-semibold hover:bg-mint shrink-0"
            >
              {geoStatus === "error" ? "Retry" : "Detect"}
            </button>
          )}
        </div>
        {geoStatus === "error" && geoError && (
          <p className="text-xs text-destructive mt-1.5">{geoError}</p>
        )}
        {geoStatus === "done" && coords && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={loading || geoStatus === "loading"}
        className="w-full px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving..." : geoStatus !== "done" ? "Save Address (zone unverified)" : "Save Address"}
      </button>

      <style>{`
        .addr-input {
          width: 100%; padding: 0.6rem 0.85rem; border-radius: 0.75rem;
          border: 1px solid var(--color-border); background: var(--color-card);
          font-size: 0.85rem; font-family: inherit;
        }
        .addr-input:focus { outline: 2px solid var(--color-ring); outline-offset: 1px; }
      `}</style>
    </form>
  );
}

function QuickLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link to={to} className="group flex items-center justify-between p-5 bg-card rounded-2xl border border-border hover:border-primary transition-colors shadow-soft">
      <div>
        <p className="font-display text-lg text-primary">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING": return "bg-amber-100 text-amber-700";
    case "CONFIRMED": return "bg-blue-100 text-blue-700";
    case "PREPARING": return "bg-indigo-100 text-indigo-700";
    case "OUT_FOR_DELIVERY": return "bg-purple-100 text-purple-700";
    case "DELIVERED": return "bg-leaf/10 text-leaf";
    case "CANCELLED": return "bg-destructive/10 text-destructive";
    default: return "bg-gray-100 text-gray-700";
  }
}

function getPaymentStatusInfo(status?: string) {
  switch (status) {
    case "CAPTURED":
      return { label: "Payment Received", textColor: "text-leaf", dotColor: "bg-leaf" };
    case "FAILED":
      return { label: "Payment Failed", textColor: "text-destructive", dotColor: "bg-destructive" };
    case "PENDING":
    default:
      return { label: "Payment Pending", textColor: "text-amber-600", dotColor: "bg-amber-600" };
  }
}

function SubInfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className="shrink-0">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 w-20 shrink-0">{label}</p>
      <p className="text-sm text-charcoal font-medium truncate">{value}</p>
    </div>
  );
}
