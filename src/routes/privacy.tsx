import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/etato/Section";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Etato Foods" },
      { name: "description", content: "How Etato Foods collects, uses and protects your information." },
    ],
  }),
  component: () => (
    <Section bg="default">
      <div className="max-w-2xl mx-auto prose prose-sm">
        <h1 className="font-display text-4xl text-primary">Privacy Policy</h1>
        <p className="text-muted-foreground mt-4">Last updated: 2025</p>
        <p className="mt-6 text-sm leading-relaxed">
          Etato Foods ("we", "our", "us") respects your privacy. This page explains what we collect when you use our
          website or place an order with us.
        </p>
        <h2 className="font-display text-2xl mt-8">Information we collect</h2>
        <p className="mt-2 text-sm">Name, phone number, email and delivery address when you subscribe or contact us.</p>
        <h2 className="font-display text-2xl mt-8">How we use it</h2>
        <p className="mt-2 text-sm">To deliver your bowls, confirm subscriptions on WhatsApp, and reply to enquiries. We never sell your data.</p>
        <h2 className="font-display text-2xl mt-8">Third parties</h2>
        <p className="mt-2 text-sm">Orders placed via Swiggy or Zomato follow their respective privacy policies.</p>
        <h2 className="font-display text-2xl mt-8">Contact</h2>
        <p className="mt-2 text-sm">Questions? Email <a className="text-primary underline" href="mailto:etatofoods@gmail.com">etatofoods@gmail.com</a>.</p>
      </div>
    </Section>
  ),
});
