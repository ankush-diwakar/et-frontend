import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/etato/Logo";
import { Leaf } from "@/components/etato/Leaf";
import { useAuth } from "@/lib/auth-context";
import loginBg from "@/assets/login_bg.png";
import phoneBg from "@/assets/phone.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Etato Foods" },
      { name: "description", content: "Login to your Etato Foods account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");

    try {
      if (mode === "signup") {
        const name = String(data.get("name") || "");
        if (!name) { setError("Please enter your name."); setLoading(false); return; }
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 w-full flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background image — phone.png on mobile, login_bg.png on desktop */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <source media="(max-width: 639px)" srcSet={phoneBg} />
        <img
          src={loginBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
      </picture>

      {/* <Leaf className="absolute -top-10 -left-10 w-72 opacity-30" />
      <Leaf className="absolute -bottom-10 -right-10 w-96 opacity-25 rotate-180" /> */}

      <div className="relative w-full max-w-md bg-white rounded-[15px] shadow-[4px_6px_0px_0px_#C9D909] p-7 sm:p-9 border-2 border-[#C9D909]">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 className="font-display text-3xl text-center text-[#0A472E]">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-center text-sm text-[#5a7060] mt-1 font-light">
          {mode === "login" ? "Login to manage your subscription." : "Join Etato to subscribe and order faster."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {mode === "signup" && (
            <Field label="Full Name">
              <input name="name" required className="auth-input" placeholder="Aakanksha" />
            </Field>
          )}
          <Field label="Email">
            <input name="email" type="email" required className="auth-input" placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required minLength={6} className="auth-input" placeholder="Min 6 characters" />
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#5a7060]">
          {mode === "login" ? "New to Etato?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="text-[#0A472E] font-bold hover:underline">
            {mode === "login" ? "Create account" : "Login"}
          </button>
        </p>
        <p className="mt-3 text-center text-xs text-[#5a7060]">
          <Link to="/" className="hover:underline">← Back home</Link>
        </p>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 4px;
          border: 1.5px solid #d0ddd4;
          background: #FFFFFF;
          font-size: 0.9rem;
          font-family: inherit;
          color: #0A472E;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus { border-color: #0A472E; box-shadow: 0 0 0 3px rgba(10,71,46,0.12); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-[#0A472E]/70">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
