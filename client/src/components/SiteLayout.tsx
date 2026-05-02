// PauseAndFlourish.com - Site Layout
// Design: Refined Magazine Meets Bold Lifestyle
// Burgundy primary, Amber accent, Cream background, Cormorant Garamond display font

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";
import { QUIZ_RESULT_KEY } from "../pages/HairQuiz";

const HAIR_TYPE_LABELS: Record<string, string> = {
  fine: "Fine Hair", thick: "Thick Hair", curly: "Curly Hair",
  coarse: "Coarse Hair", dry: "Dry Hair", normal: "Normal Hair",
  "color-treated": "Color-Treated",
};

const navHairTypes = [
  { label: "Fine Hair", href: "/hair-type/fine" },
  { label: "Thick Hair", href: "/hair-type/thick" },
  { label: "Curly Hair", href: "/hair-type/curly" },
  { label: "Coarse Hair", href: "/hair-type/coarse" },
  { label: "Dry Hair", href: "/hair-type/dry" },
  { label: "Normal Hair", href: "/hair-type/normal" },
  { label: "Color-Treated", href: "/hair-type/color-treated" },
];

const navCategories = [
  { label: "Shampoo & Conditioner", href: "/category/shampoo-conditioner" },
  { label: "Hair Masks & Treatments", href: "/category/hair-masks" },
  { label: "Serums & Oils", href: "/category/serums-oils" },
  { label: "Hair Dryers", href: "/category/hair-dryers" },
  { label: "Flat Irons", href: "/category/flat-irons" },
  { label: "Curling Irons & Wands", href: "/category/curling-irons" },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hairTypeOpen, setHairTypeOpen] = useState(false);
  const [location] = useLocation();
  const [savedHairType, setSavedHairType] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSavedHairType(data.primary || null);
      } catch {}
    }
    // Listen for storage changes (e.g. quiz completed in same tab)
    const onStorage = () => {
      const s = localStorage.getItem(QUIZ_RESULT_KEY);
      if (s) {
        try { setSavedHairType(JSON.parse(s).primary || null); } catch {}
      } else {
        setSavedHairType(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDF6EE" }}>
      {/* Affiliate Disclosure Banner */}
      <div style={{ backgroundColor: "#2C2C2C", color: "#FDF6EE" }} className="text-center py-2 px-4">
        <p className="font-body text-xs" style={{ letterSpacing: "0.03em" }}>
          As an Amazon Associate, PauseAndFlourish earns from qualifying purchases. 
          <span className="opacity-70 ml-1">Product prices and availability are accurate as of the date reviewed.</span>
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: "#FDF6EE", borderColor: "#E8DDD0" }}>
        {/* Top bar */}
        <div className="container">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/">
              <div className="flex flex-col cursor-pointer">
                <span className="font-display font-bold leading-none" style={{ fontSize: "1.8rem", color: "#8B1A2F", letterSpacing: "-0.01em" }}>
                  PauseAndFlourish
                </span>
                <span className="font-label" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#B8A99A", textTransform: "uppercase" }}>
                  Hair Care Reviews & Recommendations
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/reviews">
                <span className="nav-link">Reviews</span>
              </Link>
              <Link href="/comparisons">
                <span className="nav-link">Comparisons</span>
              </Link>
              <div className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button className="nav-link flex items-center gap-1">
                  Categories <ChevronDown size={12} />
                </button>
                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border shadow-lg z-50"
                    style={{ borderColor: "#E8DDD0" }}>
                    {navCategories.map(cat => (
                      <Link key={cat.href} href={cat.href}>
                        <div className="px-4 py-3 hover:bg-gray-50 font-body text-sm cursor-pointer"
                          style={{ color: "#2C2C2C", borderBottom: "1px solid #F5EBE0" }}>
                          {cat.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Hair Type Dropdown */}
              <div className="relative"
                onMouseEnter={() => setHairTypeOpen(true)}
                onMouseLeave={() => setHairTypeOpen(false)}
              >
                <button className="nav-link flex items-center gap-1">
                  Hair Type <ChevronDown size={12} />
                </button>
                {hairTypeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border shadow-lg z-50"
                    style={{ borderColor: "#E8DDD0" }}>
                {navHairTypes.map(ht => (
                  <Link key={ht.href} href={ht.href}>
                    <div className="px-4 py-2.5 hover:bg-amber-50 font-body text-sm cursor-pointer"
                      style={{ color: "#2C2C2C", borderBottom: "1px solid #F5EBE0" }}>
                      {ht.label}
                    </div>
                  </Link>
                ))}
                <Link href="/hair-quiz">
                  <div className="px-4 py-2.5 font-body text-sm font-semibold cursor-pointer"
                    style={{ color: "#8B1A2F", backgroundColor: "#FFF5F7" }}>
                    Not sure? Take the Quiz
                  </div>
                </Link>
                  </div>
                )}
              </div>
              {savedHairType ? (
                <Link href="/hair-quiz">
                  <span
                    className="inline-flex items-center gap-1.5 font-body font-semibold px-3 py-1.5 rounded transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: "#FFF5E6", color: "#8B1A2F", border: "1.5px solid #D4822A", fontSize: "0.78rem", letterSpacing: "0.03em" }}
                    title="Your saved hair type — click to view your quiz results"
                  >
                    <Sparkles size={12} style={{ color: "#D4822A" }} />
                    {HAIR_TYPE_LABELS[savedHairType] ?? "My Hair Type"}
                  </span>
                </Link>
              ) : (
                <Link href="/hair-quiz">
                  <span
                    className="nav-link font-semibold px-3 py-1.5 rounded transition-all duration-200"
                    style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE", letterSpacing: "0.04em", fontSize: "0.78rem" }}
                  >
                    Hair Quiz
                  </span>
                </Link>
              )}
              <Link href="/about">
                <span className="nav-link">About</span>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} style={{ color: "#8B1A2F" }} /> : <Menu size={24} style={{ color: "#8B1A2F" }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: "#E8DDD0", backgroundColor: "#FDF6EE" }}>
            <div className="container py-4 flex flex-col gap-4">
              <Link href="/reviews" onClick={() => setMobileOpen(false)}>
                <span className="nav-link block py-2">Reviews</span>
              </Link>
              <Link href="/comparisons" onClick={() => setMobileOpen(false)}>
                <span className="nav-link block py-2">Comparisons</span>
              </Link>
              <div className="border-t pt-2" style={{ borderColor: "#E8DDD0" }}>
                <p className="section-label mb-2">Categories</p>
                {navCategories.map(cat => (
                  <Link key={cat.href} href={cat.href} onClick={() => setMobileOpen(false)}>
                    <div className="py-2 font-body text-sm" style={{ color: "#2C2C2C" }}>{cat.label}</div>
                  </Link>
                ))}
              </div>
              <div className="border-t pt-2" style={{ borderColor: "#E8DDD0" }}>
                <p className="section-label mb-2">By Hair Type</p>
                {navHairTypes.map(ht => (
                  <Link key={ht.href} href={ht.href} onClick={() => setMobileOpen(false)}>
                    <div className="py-1.5 font-body text-sm" style={{ color: "#2C2C2C" }}>{ht.label}</div>
                  </Link>
                ))}
              </div>
              <Link href="/hair-quiz" onClick={() => setMobileOpen(false)}>
                <div className="py-2.5 px-4 rounded font-body text-sm font-semibold my-1"
                  style={{ backgroundColor: "#8B1A2F", color: "#FDF6EE" }}>
                  Take the Hair Type Quiz
                </div>
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)}>
                <span className="nav-link block py-2">About</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#2C2C2C", color: "#FDF6EE" }}>
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <span className="font-display font-bold" style={{ fontSize: "1.6rem", color: "#F2C4CE" }}>
                PauseAndFlourish
              </span>
              <p className="font-body text-sm mt-3 leading-relaxed" style={{ color: "#B8A99A" }}>
                Expert hair product reviews and recommendations for women. We test every product so you don't have to.
              </p>
              <p className="font-body text-xs mt-4" style={{ color: "#8C8C8C" }}>
                PauseAndFlourish is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
              </p>
            </div>

            {/* Product Categories */}
            <div>
              <p className="font-label font-bold text-xs mb-4" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4822A" }}>
                Hair Products
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/category/shampoo-conditioner">
                  <span className="font-body text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#B8A99A" }}>Shampoo & Conditioner</span>
                </Link>
                <Link href="/category/hair-masks">
                  <span className="font-body text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#B8A99A" }}>Hair Masks & Treatments</span>
                </Link>
                <Link href="/category/serums-oils">
                  <span className="font-body text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#B8A99A" }}>Serums & Oils</span>
                </Link>
              </div>
            </div>

            {/* Styling Tools */}
            <div>
              <p className="font-label font-bold text-xs mb-4" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4822A" }}>
                Styling Tools
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/category/hair-dryers">
                  <span className="font-body text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#B8A99A" }}>Hair Dryers</span>
                </Link>
                <Link href="/category/flat-irons">
                  <span className="font-body text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#B8A99A" }}>Flat Irons</span>
                </Link>
                <Link href="/category/curling-irons">
                  <span className="font-body text-sm cursor-pointer hover:text-white transition-colors" style={{ color: "#B8A99A" }}>Curling Irons & Wands</span>
                </Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-1">
              <NewsletterSignup variant="footer" />
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderColor: "#3C3C3C" }}>
            <p className="font-body text-xs" style={{ color: "#8C8C8C" }}>
              © {new Date().getFullYear()} PauseAndFlourish.com - All rights reserved.
            </p>
            <div className="flex gap-6 items-center">
              <Link href="/hair-quiz">
                <span className="font-body text-xs cursor-pointer" style={{ color: "#D4822A" }}>Hair Quiz</span>
              </Link>
              <Link href="/about">
                <span className="font-body text-xs cursor-pointer" style={{ color: "#8C8C8C" }}>About</span>
              </Link>
              <a href="mailto:hello@pauseandflourish.com" className="font-body text-xs" style={{ color: "#8C8C8C" }}>Contact</a>
              {savedHairType && (
                <button
                  onClick={() => {
                    localStorage.removeItem(QUIZ_RESULT_KEY);
                    setSavedHairType(null);
                  }}
                  className="font-body text-xs cursor-pointer transition-colors hover:text-white"
                  style={{ color: "#8C8C8C", background: "none", border: "none", padding: 0 }}
                  title="Remove your saved hair type profile"
                >
                  Clear My Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
