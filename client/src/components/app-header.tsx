import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <img
              src="/images/logos/scansblue_logo_image_and_text_as_url.png"
              alt="scansblue.com"
              className="h-12 object-contain"
            />
          </Link>

          {/* Shopping Cart */}
          <Link href="/purchase">
            <button
              className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} color="#09080E" />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
