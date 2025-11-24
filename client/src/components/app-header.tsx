import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { List, LayoutDashboard, Sparkles } from "lucide-react";
import siteInspectorLogo from "@assets/siteinspetor-logo_1764006394558.png";

export function AppHeader() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Button variant="ghost" size="sm" asChild className="h-auto p-0">
            <Link href="/">
              <img 
                src={siteInspectorLogo} 
                alt="Site Inspector"
                className="h-8 object-contain"
              />
            </Link>
          </Button>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
              data-testid="button-nav-home"
              asChild
            >
              <Link href="/">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Fast Check</span>
              </Link>
            </Button>

            <Button
              variant={location === "/analyze" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
              data-testid="button-nav-analyze"
              asChild
            >
              <Link href="/analyze">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Full Report</span>
              </Link>
            </Button>

            <Button
              variant={location === "/dashboard" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
              data-testid="button-nav-dashboard"
              asChild
            >
              <Link href="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">ScanBlue</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
