import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Purchase from "@/pages/purchase";
import Success from "@/pages/success";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import AcceptableUse from "@/pages/acceptable-use";
import DataDeletion from "@/pages/data-deletion";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analyze" component={Home} />
      <Route path="/auditor" component={Home} />
      <Route path="/pricing" component={Home} />
      <Route path="/purchase" component={Purchase} />
      <Route path="/success" component={Success} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/acceptable-use" component={AcceptableUse} />
      <Route path="/data-deletion" component={DataDeletion} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppHeader />

        <main className="min-h-[calc(100vh-64px)]">
          <Router />
        </main>

        <Footer />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
