import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Loader2, Ban, CheckCircle2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUserForSub, setSelectedUserForSub] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subForm, setSubForm] = useState({
    planId: "",
    deliverySlot: "LUNCH",
    dietaryPref: "REGULAR_VEG",
    bowlPreference: "",
    startDate: "",
  });
  const [submittingSub, setSubmittingSub] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchPlans();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await api<{ customers: any[] }>("/admin/customers");
      setCustomers(data.customers);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await api<{ plans: any[] }>("/subscriptions/plans");
      setPlans(data.plans);
    } catch (_) {}
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api(`/admin/customers/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      toast.success("Status updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleAssignSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSub) return;
    if (!subForm.planId || !subForm.deliverySlot || !subForm.startDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmittingSub(true);
    try {
      const res = await api<any>(`/admin/customers/${selectedUserForSub.id}/subscription`, {
        method: "POST",
        body: JSON.stringify(subForm),
      });
      toast.success("Subscription assigned successfully!");
      
      // Update local customers state
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedUserForSub.id
            ? { ...c, subscriptions: [res.subscription] }
            : c
        )
      );
      setSelectedUserForSub(null);
      // Reset form
      setSubForm({ planId: "", deliverySlot: "LUNCH", dietaryPref: "REGULAR_VEG", bowlPreference: "", startDate: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to assign subscription");
    } finally {
      setSubmittingSub(false);
    }
  };

  const handleUpdateSubStatus = async (subId: string, newStatus: string, userId: string) => {
    const confirmMsg = `Are you sure you want to change this subscription status to ${newStatus}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api<any>(`/admin/customers/subscription/${subId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Subscription updated successfully!");
      
      // Update local customers state
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === userId
            ? { ...c, subscriptions: [res.subscription] }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update subscription status");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary flex items-center gap-2">
          <Users className="h-6 w-6 text-leaf" /> Customers
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage user accounts and assign or cancel subscriptions.</p>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">{error}</div>}

      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-mint/30 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((user) => (
                <tr key={user.id} className="hover:bg-mint/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-primary">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div>{user.email}</div>
                    <div className="text-xs mt-0.5">{user.phone || "No phone"}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.subscriptions && user.subscriptions.length > 0 ? (
                      (() => {
                        const sub = user.subscriptions[0];
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-primary">{sub.plan?.name || sub.planId}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                sub.status === "ACTIVE" ? "bg-leaf/10 text-leaf" : "bg-amber-100 text-amber-700"
                              }`}>
                                {sub.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Slot: {sub.deliverySlot} | Diet: {sub.dietaryPref}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
                            </div>
                            {/* Status change actions */}
                            <div className="flex items-center gap-2 mt-1">
                              {sub.status === "ACTIVE" ? (
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "PAUSED", user.id)}
                                  className="text-[10px] text-amber-600 hover:underline font-semibold"
                                >
                                  Pause
                                </button>
                              ) : sub.status === "PAUSED" ? (
                                <button
                                  onClick={() => handleUpdateSubStatus(sub.id, "ACTIVE", user.id)}
                                  className="text-[10px] text-leaf hover:underline font-semibold"
                                >
                                  Activate
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleUpdateSubStatus(sub.id, "CANCELLED", user.id)}
                                className="text-[10px] text-destructive hover:underline font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div>
                        <span className="text-xs text-muted-foreground italic">None</span>
                        <button
                          onClick={() => setSelectedUserForSub(user)}
                          className="block text-[10px] text-leaf hover:underline font-bold mt-1"
                        >
                          + Assign Plan
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === "ACTIVE" ? "bg-leaf/10 text-leaf" : "bg-destructive/10 text-destructive"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleStatusChange(user.id, "BLOCKED")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-destructive/10 text-destructive text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Ban className="h-3.5 w-3.5" /> Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, "ACTIVE")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted hover:bg-leaf/10 text-leaf text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUserForSub && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-mint/30 px-6 py-4 flex items-center justify-between border-b border-border">
              <h3 className="font-display text-lg text-primary flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-leaf" /> Assign Subscription
              </h3>
              <button
                onClick={() => setSelectedUserForSub(null)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleAssignSub} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Assigning to:</p>
                <p className="font-semibold text-primary mt-0.5">{selectedUserForSub.name} ({selectedUserForSub.email})</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Subscription Plan *</label>
                <select
                  required
                  value={subForm.planId}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, planId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-primary"
                >
                  <option value="">Select Plan...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Delivery Slot *</label>
                  <select
                    required
                    value={subForm.deliverySlot}
                    onChange={(e) => setSubForm((prev) => ({ ...prev, deliverySlot: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-primary"
                  >
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Dietary Preference *</label>
                  <select
                    required
                    value={subForm.dietaryPref}
                    onChange={(e) => setSubForm((prev) => ({ ...prev, dietaryPref: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-primary"
                  >
                    <option value="REGULAR_VEG">Regular Veg</option>
                    <option value="JAIN">Jain</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Bowl Preference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. No onions, extra cottage cheese"
                  value={subForm.bowlPreference}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, bowlPreference: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">Start Date *</label>
                <input
                  type="date"
                  required
                  value={subForm.startDate}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-primary"
                />
              </div>

              <button
                type="submit"
                disabled={submittingSub}
                className="w-full mt-4 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingSub && <Loader2 className="h-4 w-4 animate-spin" />}
                {submittingSub ? "Assigning..." : "Assign Subscription Plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
