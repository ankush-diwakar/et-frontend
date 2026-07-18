import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, UtensilsCrossed, MessageSquare, TrendingUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardHome,
});

interface DashboardStats {
  customers: number;
  menuItems: number;
  pendingContacts: number;
}

function AdminDashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ stats: DashboardStats }>("/admin/stats")
      .then((data) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B412B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome to the Etato Foods admin center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats?.customers.toString() || "0"}
          icon={Users}
          color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          title="Active Menu Items"
          value={stats?.menuItems.toString() || "0"}
          icon={UtensilsCrossed}
          color="bg-leaf/10 text-leaf"
        />
        <StatCard
          title="Pending Messages"
          value={stats?.pendingContacts.toString() || "0"}
          icon={MessageSquare}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="Monthly Revenue"
          value="₹0"
          subtitle="Coming in Phase 3"
          icon={TrendingUp}
          color="bg-primary/10 text-primary"
        />
      </div>

      {/* Quick Actions or Recent Activity could go here later */}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-soft flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
        <h3 className="font-display text-2xl text-primary mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
