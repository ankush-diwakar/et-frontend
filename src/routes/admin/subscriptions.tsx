import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Repeat, Loader2, Calendar, Clock, ChevronLeft, ChevronRight, User, Package } from "lucide-react";
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary flex items-center gap-2">
            <Repeat className="h-6 w-6 text-leaf" /> Subscriptions Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage weekly and monthly customer subscriptions.</p>
        </div>
      </div>

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
