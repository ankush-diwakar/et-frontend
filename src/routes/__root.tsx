import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import faviconUrl from "../assets/weblogo.png?url";
import { Header } from "@/components/etato/Header";
import { Footer } from "@/components/etato/Footer";
import { AnnouncementBar } from "@/components/etato/AnnouncementBar";
import { WhatsAppFloat } from "@/components/etato/WhatsAppFloat";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { CartPanel } from "@/components/etato/CartPanel";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Etato Foods — Fresh Protein-Rich Salad Bowls · Katraj, Pune" },
      { name: "description", content: "100% Pure Veg high-protein salad bowls delivered fresh in Katraj, Pune. Jain options available. Choose Better. Today." },
      { name: "author", content: "Etato Foods" },
      { property: "og:title", content: "Etato Foods — Fresh Protein-Rich Salad Bowls" },
      { property: "og:description", content: "Fresh, 100% pure veg protein bowls delivered in Katraj, Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: faviconUrl },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geologica:wght@200;300;400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const isSpa = typeof window !== "undefined" && window.__SPA__ === true;
  if (isSpa) {
    return <>{children}</>;
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-cream">
          <AnnouncementBar />
          <Header />
          <main className="flex-1 flex flex-col">
            <Outlet />
          </main>
          <Footer />
          <WhatsAppFloat />
        </div>
        <CartPanel />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
