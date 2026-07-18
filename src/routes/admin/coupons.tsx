import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCouponsPlaceholder,
});

function AdminCouponsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center mb-6">
        <Tag className="h-10 w-10 text-leaf" />
      </div>
      <h2 className="font-display text-3xl text-primary">Coupons Management</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Discount codes and promotional coupons will be implemented in Phase 3 alongside payments.
      </p>
    </div>
  );
}
