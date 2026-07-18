import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPlaceholder,
});

function AdminSettingsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center mb-6">
        <Settings className="h-10 w-10 text-leaf" />
      </div>
      <h2 className="font-display text-3xl text-primary">System Settings</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Global settings like delivery radius, store open/close status, and tax rates will be managed here.
      </p>
    </div>
  );
}
