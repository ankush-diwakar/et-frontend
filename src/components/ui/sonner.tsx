import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group font-body"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-primary group-[.toaster]:border-border group-[.toaster]:shadow-card rounded-2xl p-4",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-semibold rounded-full px-4 py-2",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-semibold rounded-full px-4 py-2",
          success: "group-[.toaster]:bg-mint group-[.toaster]:text-primary group-[.toaster]:border-leaf/20",
          error: "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
