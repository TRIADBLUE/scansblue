import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, List, Code2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import siteInspectorLogo from "@assets/siteinspetor-logo_1764201469395.png";

const navItems = [
  { path: "/", label: "Quick Analysis", icon: Sparkles },
  { path: "/analyze", label: "Comprehensive Analysis", icon: List },
  { path: "/auditor", label: "Code and Site Auditor", icon: Code2 },
];

export function AppHeader() {
  const [location, setLocation] = useLocation();

  const currentItem = navItems.find((item) => item.path === location) || navItems[2];
  const otherItems = navItems.filter((item) => item.path !== location);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="h-auto p-0">
            <Link href="/">
              <img 
                src={siteInspectorLogo} 
                alt="Site Inspector"
                className="h-8 object-contain"
              />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#A00028] text-[#A00028] bg-transparent hover:bg-[#A00028]/10"
                data-testid="button-nav-dropdown"
              >
                <currentItem.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{currentItem.label}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {otherItems.map((item) => (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className="gap-2 cursor-pointer"
                  data-testid={`button-nav-${item.path.replace("/", "") || "home"}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
