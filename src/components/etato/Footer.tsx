import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A472E] text-white mt-20">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <Logo variant="light" />
          <p className="mt-5 text-sm opacity-80 leading-relaxed font-light">
            Sr No. 135, Pooja Niwas Housing Society,<br />
            Flat No. 1006, Pune Satara Road,<br />
            Near Katraj Dairy, Katraj, Pune – 411046
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["100% Pure Veg", "Jain Options", "FSSAI Registered"].map((tag) => (
              <span
                key={tag}
                className="chip text-[10px] uppercase tracking-wider"
                style={{ background: "#C9D909", color: "#0A472E" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9D909] mb-4">Explore</h4>
          <ul className="space-y-2 text-sm font-light">
            {[
              ["Menu", "/menu"],
              ["Subscribe", "/subscribe"],
              ["About", "/about"],
              ["Nutrition", "/nutrition"],
              ["Blog", "/blog"],
              ["Contact", "/contact"],
              ["Privacy Policy", "/privacy"],
            ].map(([l, t]) => (
              <li key={t}>
                <Link to={t} className="opacity-75 hover:opacity-100 hover:text-[#C9D909] transition-colors">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#C9D909] mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm font-light">
            <li>
              <a href="tel:+917499934425" className="flex items-center gap-2 opacity-75 hover:opacity-100 hover:text-[#C9D909] transition-colors">
                <Phone className="h-4 w-4 shrink-0" /> +91 74999 34425
              </a>
            </li>
            <li>
              <a href="mailto:etatofoods@gmail.com" className="flex items-center gap-2 opacity-75 hover:opacity-100 hover:text-[#C9D909] transition-colors">
                <Mail className="h-4 w-4 shrink-0" /> etatofoods@gmail.com
              </a>
            </li>
            <li>
              <a href="https://instagram.com/etatofoods" target="_blank" rel="noreferrer" className="flex items-center gap-2 opacity-75 hover:opacity-100 hover:text-[#C9D909] transition-colors">
                <Instagram className="h-4 w-4 shrink-0" /> @etatofoods
              </a>
            </li>
            <li>
              <a href="https://maps.app.goo.gl/9WxXVa8NAwYytdta6" target="_blank" rel="noreferrer" className="flex items-center gap-2 opacity-75 hover:opacity-100 hover:text-[#C9D909] transition-colors">
                <MapPin className="h-4 w-4 shrink-0" /> Get Directions
              </a>
            </li>
          </ul>
          <div className="mt-5 text-xs opacity-75 font-light">
            Mon–Sat · Lunch 12:00–2:30 PM · Dinner 7:00–9:30 PM<br />
            <span className="font-bold text-[#C9D909]">Sunday OFF</span>
          </div>
        </div>
      </div>

      <div className="bg-[#C9D909] text-[#0A472E]">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between font-display text-[13px] sm:text-sm tracking-wide uppercase">
          <div className="text-center md:text-left mb-1 md:mb-0">
            Copyright ©{new Date().getFullYear()} EtatoFoods. All Rights Reserved.
          </div>
          <div className="text-center md:text-right">
            ETATO FOODS, PUNE
          </div>
        </div>
      </div>
    </footer>
  );
}
