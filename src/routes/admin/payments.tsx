import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CreditCard, Loader2, IndianRupee, Calendar, CheckCircle2, AlertCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCaptured, setTotalCaptured] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api<any>(`/admin/payments?page=${currentPage}&limit=${itemsPerPage}`);
      setPayments(data.payments);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      setTotalCaptured(data.totalCaptured || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CAPTURED":
      case "PAID":
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-leaf/10 text-leaf">
            <CheckCircle2 className="h-3 w-3" /> Captured
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive">
            <AlertCircle className="h-3 w-3" /> {status}
          </span>
        );
    }
  };

  const getPayerName = (payment: any) => {
    if (payment.subscription?.user) {
      return payment.subscription.user;
    }
    if (payment.order?.user) {
      return payment.order.user;
    }
    return null;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" /></div>;

  // Pagination Calculations
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-primary flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-leaf" /> Payment Transactions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor all checkout orders and subscription plan purchases.</p>
        </div>
        
        {/* Simple Summary Cards */}
        <div className="flex gap-4">
          <div className="bg-card px-4 py-3 rounded-2xl border border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-leaf/10 text-leaf flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Captured</p>
              <p className="font-display text-base text-primary">
                ₹{(totalCaptured / 100).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">{error}</div>}

      <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-mint/30 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Payer</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => {
                const payer = getPayerName(payment);
                const isSub = !!payment.subscriptionId;
                
                return (
                  <tr key={payment.id} className="hover:bg-mint/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary flex items-center gap-2">
                        {payment.razorpayPaymentId && payment.razorpayPaymentId.startsWith("pay_") 
                          ? payment.razorpayPaymentId 
                          : payment.razorpayPaymentId && payment.razorpayPaymentId.startsWith("MANUAL")
                            ? "Manual Payment"
                            : <span className="font-mono text-sm uppercase" title={payment.id}>#{payment.id.split('-')[0]}</span>
                        }
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase text-charcoal/80">
                          {payment.method ? payment.method.replace(/_/g, ' ') : "Razorpay"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payer ? (
                        <div>
                          <div className="font-semibold text-primary">{payer.name}</div>
                          <div className="text-xs text-muted-foreground">{payer.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unknown User</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isSub ? (
                        <div>
                          <span className="inline-flex px-2 py-0.5 bg-mint/50 text-leaf text-[10px] font-bold rounded-md">
                            Subscription
                          </span>
                          <div className="text-xs text-primary font-semibold mt-1">
                            {payment.subscription?.plan?.name || "Premium Plan"}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold rounded-md">
                            One-time Order
                          </span>
                          {payment.order?.orderNumber && (
                            <div className="text-xs text-primary font-semibold mt-1">
                              Order #{payment.order.orderNumber}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      ₹{(payment.amount / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                      {payment.failureReason && (
                        <div className="text-[10px] text-destructive mt-1 max-w-[150px] truncate" title={payment.failureReason}>
                          {payment.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No payment transactions found.
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
              of <span className="font-semibold text-primary">{totalItems}</span> transactions
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
