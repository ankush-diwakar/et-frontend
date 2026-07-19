import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Repeat, Loader2, Calendar, Clock, ChevronLeft, ChevronRight, User, Package, Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
});

const SUBSCRIPTION_STATUSES = [
  "PENDING",
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "COMPLETED",
  "EXPIRED"
];

function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "plans">("subscriptions");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary flex items-center gap-2">
            <Repeat className="h-6 w-6 text-leaf" /> Subscriptions Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage weekly and monthly customer subscriptions and plans.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "subscriptions" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
          }`}
        >
          User Subscriptions
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "plans" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
          }`}
        >
          Subscription Plans
        </button>
      </div>

      {activeTab === "subscriptions" ? <UserSubscriptionsTab /> : <SubscriptionPlansTab />}
    </div>
  );
}

// ─── USER SUBSCRIPTIONS TAB ──────────────────────────────────────────────

function UserSubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await api<any>(`/admin/subscriptions?page=${currentPage}&limit=${itemsPerPage}`);
      setSubscriptions(data.subscriptions || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, status: string) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await api(`/admin/subscriptions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Subscription status updated", { id: loadingToast });
      setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status } : s));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status", { id: loadingToast });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-leaf/10 text-leaf border-leaf/20";
      case "COMPLETED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      case "EXPIRED": return "bg-destructive/10 text-destructive border-destructive/20";
      case "PAUSED": return "bg-amber-100 text-amber-700 border-amber-200";
      case "PENDING": return "bg-sky-100 text-sky-700 border-sky-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading && subscriptions.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-4">
      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">{error}</div>}

      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-mint/30 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan & Preferences</th>
                <th className="px-6 py-4">Dates & Slot</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-mint/10 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-mint/50 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-leaf" />
                        </div>
                        <div>
                          <p className="font-bold text-primary">{sub.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{sub.user?.phone || sub.user?.email || "No contact"}</p>
                          <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5" title={sub.id}>
                            ID: {sub.id.split("-")[0]}...
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Plan & Preferences */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-primary">{sub.plan?.name || "Unknown Plan"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Pref: <span className="font-medium text-primary">{sub.dietaryPref === "JAIN" ? "Jain" : "Regular Veg"}</span>
                          </p>
                          {sub.bowlPreference && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Bowl: <span className="font-medium text-primary">{sub.bowlPreference}</span>
                            </p>
                          )}
                          {sub.specialNotes && (
                            <p className="text-xs text-amber-600 mt-1 max-w-[150px] truncate" title={sub.specialNotes}>
                              Note: {sub.specialNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Dates & Slot */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Start: <span className="font-medium text-primary">{new Date(sub.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0 opacity-50" />
                          <span>End: <span className="font-medium text-primary">
                            {sub.plan?.durationDays ? (
                              new Date(new Date(sub.startDate).getTime() + (sub.plan.durationDays * 24 * 60 * 60 * 1000)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            ) : (
                              "N/A"
                            )}
                          </span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-medium text-primary">{sub.deliverySlot === "LUNCH" ? "Lunch" : "Dinner"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <select
                          className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-leaf/50"
                          value={sub.status}
                          onChange={(e) => updateSubscriptionStatus(sub.id, e.target.value)}
                        >
                          {SUBSCRIPTION_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border bg-card px-6 py-4 gap-4">
          <div className="text-xs text-muted-foreground order-2 sm:order-1">
            Showing <span className="font-semibold text-primary">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold text-primary">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-primary">{totalItems}</span> subscriptions
          </div>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-background text-primary hover:bg-muted disabled:opacity-50 disabled:hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: totalPages === 0 ? 1 : totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-semibold border transition-colors ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-primary hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.max(1, totalPages)))}
              disabled={currentPage === Math.max(1, totalPages)}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-background text-primary hover:bg-muted disabled:opacity-50 disabled:hover:bg-background transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUBSCRIPTION PLANS TAB ──────────────────────────────────────────────

function SubscriptionPlansTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "WEEKLY",
    durationDays: 6,
    bowlsCount: 6,
    originalPrice: 0,
    price: 0,
    discountPct: 0,
    perBowlPrice: 0,
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api<any>(`/admin/subscription-plans`);
      setPlans(data.plans || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        id: plan.id,
        name: plan.name,
        type: plan.type,
        durationDays: plan.durationDays,
        bowlsCount: plan.bowlsCount,
        originalPrice: plan.originalPrice,
        price: plan.price,
        discountPct: plan.discountPct,
        perBowlPrice: plan.perBowlPrice,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder
      });
    } else {
      setEditingPlan(null);
      setFormData({
        id: "",
        name: "",
        type: "WEEKLY",
        durationDays: 6,
        bowlsCount: 6,
        originalPrice: 0,
        price: 0,
        discountPct: 0,
        perBowlPrice: 0,
        isActive: true,
        sortOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingPlan ? "Updating plan..." : "Creating plan...");
    try {
      const payload = {
        ...formData,
        durationDays: parseInt(formData.durationDays.toString()),
        bowlsCount: parseInt(formData.bowlsCount.toString()),
        originalPrice: parseInt(formData.originalPrice.toString()),
        price: parseInt(formData.price.toString()),
        discountPct: parseInt(formData.discountPct.toString()),
        perBowlPrice: parseInt(formData.perBowlPrice.toString()),
        sortOrder: parseInt(formData.sortOrder.toString()),
      };
      
      // Don't send id if it's empty for new creation
      if (!payload.id) delete payload.id;

      if (editingPlan) {
        await api(`/admin/subscription-plans/${editingPlan.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await api(`/admin/subscription-plans`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      
      toast.success(`Plan ${editingPlan ? "updated" : "created"} successfully`, { id: loadingToast });
      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || "Failed to save plan", { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan? This cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting plan...");
    try {
      await api(`/admin/subscription-plans/${id}`, { method: "DELETE" });
      toast.success("Plan deleted successfully", { id: loadingToast });
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan", { id: loadingToast });
    }
  };

  if (loading && plans.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Plan
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-mint/30 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name & Type</th>
                <th className="px-6 py-4">Duration & Bowls</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No plans found.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-mint/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{plan.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary">{plan.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary font-medium">{plan.durationDays} Days</p>
                      <p className="text-xs text-muted-foreground">{plan.bowlsCount} Bowls</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-primary font-medium">₹{plan.price}</p>
                      <p className="text-[10px] text-muted-foreground line-through">₹{plan.originalPrice}</p>
                      <p className="text-xs text-leaf font-semibold">₹{plan.perBowlPrice}/bowl ({plan.discountPct}% off)</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        plan.isActive ? "bg-leaf/10 text-leaf border-leaf/20" : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(plan)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl border border-border">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-bold text-primary">
                  {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* ID (Only for creation) */}
                  {!editingPlan && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-primary">ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. monthly"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                      />
                      <p className="text-[10px] text-muted-foreground">Leave empty to auto-generate.</p>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Plan Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Monthly Plan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    >
                      <option value="TRIAL">TRIAL</option>
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="MONTHLY">MONTHLY</option>
                    </select>
                  </div>

                  {/* Duration Days */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Duration (Days)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Bowls Count */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Total Bowls</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.bowlsCount}
                      onChange={(e) => setFormData({ ...formData, bowlsCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Original Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Original Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Discounted Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Discounted Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>
                  
                  {/* Per Bowl Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Per Bowl Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.perBowlPrice}
                      onChange={(e) => setFormData({ ...formData, perBowlPrice: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Discount Pct */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Discount %</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.discountPct}
                      onChange={(e) => setFormData({ ...formData, discountPct: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Sort Order</label>
                    <input
                      required
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf/50"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="space-y-2 sm:col-span-2 flex items-center gap-3">
                    <label className="text-sm font-semibold text-primary">Active Status</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isActive ? "bg-leaf" : "bg-muted"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {editingPlan ? "Save Changes" : "Create Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
