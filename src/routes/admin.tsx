import { Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { LayoutDashboard, UtensilsCrossed, ListTree, Users, ReceiptText, BookOpen, Settings, Tag, MessageSquare, Menu, X, Leaf, CreditCard, Loader2, Repeat } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/etato/Logo";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/menu", label: "Menu Items", icon: UtensilsCrossed },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/orders", label: "Orders", icon: ReceiptText },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/blog", label: "Blog", icon: BookOpen },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate({ to: "/login", replace: true });
      } else if (user?.role !== "SUPER_ADMIN") {
        navigate({ to: "/", replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading || !user || user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-mint/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint/20 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-leaf bg-leaf/10 px-2 py-0.5 rounded-full mt-1.5">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-leaf/10 text-leaf"
                    : "text-muted-foreground hover:bg-mint hover:text-primary"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-leaf" : "text-muted-foreground"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link to="/" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-sm font-semibold text-primary hover:bg-mint transition-colors">
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Floating Mobile Sidebar Trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-card border border-border text-primary hover:bg-mint rounded-xl shadow-soft"
        >
          <Menu className="h-5 w-5" />
        </button>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
