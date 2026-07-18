import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/etato/Section";
import { Check, ArrowRight, Package } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  return (
    <Section bg="mint" className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-card max-w-md w-full rounded-3xl p-8 sm:p-12 border border-border shadow-soft text-center">
        <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-leaf" />
        </div>
        
        <h1 className="font-display text-4xl text-primary mb-3">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for choosing Etato. Your fresh protein bowl is being prepared and will be delivered during your selected slot.
        </p>

        <div className="space-y-3">
          <Link
            to="/profile"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-card"
          >
            <Package className="h-4 w-4" /> Track Order Status
          </Link>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-border bg-background text-primary font-semibold hover:bg-mint/30 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </Section>
  );
}
