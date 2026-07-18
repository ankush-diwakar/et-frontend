import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ReceiptText, Loader2, Calendar, Clock, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api<any>(`/admin/orders?page=${currentPage}&limit=${itemsPerPage}`);
      setOrders(data.orders);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await api(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Order status updated", { id: loadingToast });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status", { id: loadingToast });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-leaf/10 text-leaf border-leaf/20";
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      case "OUT_FOR_DELIVERY": return "bg-sky-100 text-sky-700 border-sky-200";
      case "PREPARING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "CONFIRMED": return "bg-mint text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading && orders.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-leaf" /> Orders Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all one-time orders and their delivery statuses.</p>
        </div>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">{error}</div>}

      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-mint/30 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                return (
                  <tr key={order.id} className="hover:bg-mint/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                        <Clock className="h-3.5 w-3.5 ml-1" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary">{order.user?.name || "Unknown User"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{order.user?.email || "-"}</div>
                      {order.user?.phone && (
                        <div className="text-xs text-muted-foreground mt-0.5">{order.user.phone}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-semibold text-charcoal/80 mb-1">
                            <ShoppingBag className="h-3.5 w-3.5" /> {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Items
                          </div>
                          {order.items.map((item: any) => (
                            <div key={item.id} className="text-xs text-muted-foreground">
                              {item.quantity}x {item.menuItemName}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No items found</span>
                      )}
                      
                      {order.specialNotes && (
                        <div className="mt-2 text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                          <span className="font-bold">Note:</span> {order.specialNotes}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 font-semibold text-primary">
                      ₹{order.total.toLocaleString("en-IN")}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`appearance-none w-full pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border focus:outline-none focus:ring-2 focus:ring-leaf/50 transition-colors cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s} className="bg-background text-foreground">{s.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                          <ChevronRight className="h-3 w-3 rotate-90" />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ReceiptText className="h-8 w-8 mb-2 opacity-20" />
                      <p>No orders found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border bg-card px-6 py-4 gap-4">
            <div className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing <span className="font-semibold text-primary">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
              <span className="font-semibold text-primary">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-primary">{totalItems}</span> orders
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-background text-primary hover:bg-muted disabled:opacity-50 disabled:hover:bg-background transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
