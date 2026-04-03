import { Link, useLocation } from "wouter";
import { SITE_CONFIG } from "@/config/site-config";

export function AppHeader() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <img
              src="/images/logos/scansblue_logo_image_and_text_as_url.png"
              alt="scansblue.com"
              className="h-16 object-contain"
            />
          </Link>

          {/* Navigation — reads from SITE_CONFIG.tabs */}
          <nav className="flex items-center gap-6">
            {SITE_CONFIG.tabs.map(tab => {
              const isActive = location === tab.path ||
                (tab.path === "/" && location === "/") ||
                (tab.path !== "/" && location.startsWith(tab.path));

              return (
                <a
                  key={tab.id}
                  href={`/?tab=${tab.queryParam}`}
                  style={{
                    color: isActive ? SITE_CONFIG.colors.primary : SITE_CONFIG.colors.foreground,
                    fontFamily: '"Archivo", sans-serif',
                    fontVariationSettings: '"wdth" 112.5',
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                    borderBottom: isActive ? `2px solid ${SITE_CONFIG.colors.primary}` : "2px solid transparent",
                    paddingBottom: "2px",
                    transition: "all 0.2s ease",
                  }}
                  className="hidden md:inline-block"
                >
                  {tab.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
