import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Menu, X, User, LogOut, ChevronDown, ShoppingBag } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/subscribe", label: "Subscribe" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 backdrop-blur-md transition-all border-b border-[#d0ddd4]/40",
        scrolled ? "bg-[#FFFDF6]/80 shadow-[0_2px_12px_-4px_rgba(10,71,46,0.12)]" : "bg-[#FFFDF6]/40"
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7 mx-auto">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-semibold text-[#0A472E]/70 hover:text-[#0A472E] transition-colors relative group"
              activeProps={{ className: "text-[#0A472E] font-bold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#C9D909] group-hover:w-full transition-all duration-200" />
            </Link>
          ))}
          {isAuthenticated && user && (
            <Link
              to="/profile"
              className="text-sm font-semibold text-[#0A472E]/70 hover:text-[#0A472E] transition-colors relative group"
              activeProps={{ className: "text-[#0A472E] font-bold" }}
            >
              Profile
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#C9D909] group-hover:w-full transition-all duration-200" />
            </Link>
          )}
          {isAuthenticated && user?.role === "SUPER_ADMIN" && (
            <a
              href="/admin"
              className="text-sm font-semibold text-[#0F5E3D] hover:text-[#0A472E] transition-colors"
            >
              Admin
            </a>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          <Link
            to="/menu"
            className="btn-primary text-xs px-5"
            style={{ height: "42px", minWidth: "unset" }}
          >
            Order Now
          </Link>

          {isAuthenticated && user ? (
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[5px] hover:bg-[#f0f5d0] text-[#0A472E] text-sm font-semibold transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#0A472E] text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden xl:inline max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-[5px] shadow-[0_4px_24px_-8px_rgba(10,71,46,0.18)] border border-[#d0ddd4] overflow-hidden py-1 z-50">
                  <div className="px-4 py-3 border-b border-[#d0ddd4]">
                    <p className="text-sm font-bold text-[#0A472E] truncate">{user.name}</p>
                    <p className="text-xs text-[#5a7060] truncate">{user.email}</p>
                    {user.phone && <p className="text-xs text-[#5a7060] mt-0.5">{user.phone}</p>}
                  </div>
                  {user.role === "SUPER_ADMIN" && (
                    <a
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#f0f5d0] transition-colors text-[#0F5E3D] font-bold"
                    >
                      Admin Dashboard
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#f0f5d0] transition-colors text-[#D94B3D] font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 p-2 rounded-[5px] hover:bg-[#f0f5d0] text-[#0A472E] transition-colors"
              aria-label="Login"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          {/* Cart (Desktop) */}
          <button
            onClick={toggleCart}
            className="ml-1 relative p-2 rounded-[5px] hover:bg-[#f0f5d0] text-[#0A472E] transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9D909] text-[#0A472E] text-[10px] font-bold border-2 border-[#FFFDF6]">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Cart (Mobile) */}
        <button
          onClick={toggleCart}
          className="lg:hidden ml-auto relative p-2 text-[#0A472E] hover:bg-[#f0f5d0] rounded-[5px] transition-colors"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9D909] text-[#0A472E] text-[10px] font-bold border-2 border-[#FFFDF6]">
              {totalItems}
            </span>
          )}
        </button>

        <button
          className="lg:hidden ml-2 p-2 text-[#0A472E]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-[#d0ddd4] bg-[#FFFDF6]">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-[5px] text-sm font-semibold text-[#0A472E] hover:bg-[#f0f5d0] transition-colors"
                activeProps={{ className: "bg-[#f0f5d0] text-[#0A472E] font-bold border-l-2 border-[#C9D909]" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-[5px] text-sm font-semibold text-[#0A472E] hover:bg-[#f0f5d0] transition-colors"
                activeProps={{ className: "bg-[#f0f5d0] text-[#0A472E] font-bold border-l-2 border-[#C9D909]" }}
              >
                Profile
              </Link>
            )}
            {isAuthenticated && user?.role === "SUPER_ADMIN" && (
              <a
                href="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-[5px] text-sm font-bold text-[#0F5E3D] hover:bg-[#f0f5d0]"
              >
                Admin Dashboard
              </a>
            )}

            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mt-1 border-t border-[#d0ddd4]">
                  <div className="w-9 h-9 rounded-full bg-[#0A472E] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0A472E] truncate">{user.name}</p>
                    <p className="text-xs text-[#5a7060] truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-[5px] text-sm font-semibold text-[#0A472E] hover:bg-[#f0f5d0]"
                >
                  Manage Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="px-3 py-2.5 rounded-[5px] text-sm font-semibold hover:bg-[#f0f5d0] text-[#D94B3D] text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-[5px] text-sm font-semibold text-[#0A472E] hover:bg-[#f0f5d0] flex items-center gap-2"
              >
                <User className="h-4 w-4" /> Login
              </Link>
            )}

            <div className="pt-2">
              <Link
                to="/menu"
                onClick={() => setOpen(false)}
                className="block text-center btn-primary w-full"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
