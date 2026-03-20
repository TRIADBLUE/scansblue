import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import quickAnalysisIcon from "@assets/quick_analysis_icon_1768197865904.png";
import comprehensiveIcon from "@assets/comprehensive_icon_1768197865904.png";
import auditorIcon from "@assets/auditor_icon_1768197865903.png";

const navItems = [
  { path: "/", label: "Quick Analysis", iconSrc: quickAnalysisIcon },
  { path: "/analyze", label: "Comprehensive Analysis", iconSrc: comprehensiveIcon },
  { path: "/auditor", label: "Code and Site Auditor", iconSrc: auditorIcon },
];

export function AppHeader() {
  const [location, setLocation] = useLocation();

  const currentItem = navItems.find((item) => item.path === location) || navItems[2];
  const otherItems = navItems.filter((item) => item.path !== location);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <img
              src="/scansblue-logo.png"
              alt="Your Site Inspector Agent"
              className="h-16 object-contain"
            />
          </Link>

          {/* Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#A00028] bg-transparent text-[#A00028] hover:bg-[#A00028]/10 focus:outline-none focus:ring-2 focus:ring-[#A00028]"
                data-testid="button-nav-dropdown"
              >
                <img src={currentItem.iconSrc} alt="" className="w-5 h-5" />
                <span className="hidden sm:inline">{currentItem.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {otherItems.map((item) => (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-[#A00028]/10 rounded-md"
                  data-testid={`button-nav-${item.path.replace("/", "") || "home"}`}
                >
                  <img src={item.iconSrc} alt="" className="w-5 h-5" />
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