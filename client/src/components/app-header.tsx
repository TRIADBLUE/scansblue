import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, List } from "lucide-react";

export function AppHeader() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">Site Inspector</span>
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
          </nav>
        </div>
      </div>
    </header>
  );
}
