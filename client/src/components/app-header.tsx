import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { List, LayoutDashboard } from "lucide-react";
import siteInspectorLogo from "@assets/siteinspetor-logo_1764004383843.png";

export function AppHeader() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src={siteInspectorLogo} 
                alt="Site Inspector"
                className="h-8 object-contain"
              />
            </a>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="button-nav-home"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </Button>
            </Link>

            <Link href="/analyze">
              <Button
                variant={location === "/analyze" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="button-nav-analyze"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant={location === "/dashboard" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="button-nav-dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
