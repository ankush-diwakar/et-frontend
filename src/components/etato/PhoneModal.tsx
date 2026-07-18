import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Phone, X } from "lucide-react";

interface PhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PhoneModal({ open, onClose, onSuccess }: PhoneModalProps) {
  const { updatePhone } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/\s+/g, "");
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      await updatePhone(cleaned.startsWith("+91") ? cleaned : `+91${cleaned}`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-card p-6 sm:p-8 border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-mint text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center text-leaf mx-auto">
          <Phone className="h-6 w-6" />
        </div>

        <h2 className="mt-4 font-display text-2xl text-center">Add your phone number</h2>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          We need your phone number to confirm orders and delivery updates via WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/70">
              Phone / WhatsApp *
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground px-3 py-2.5 bg-mint rounded-xl">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="74999 34425"
                maxLength={10}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-[inherit] focus:outline-2 focus:outline-ring focus:outline-offset-1"
                autoFocus
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Phone Number"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          Your number is only used for order confirmations and delivery.
        </p>
      </div>
    </div>
  );
}
