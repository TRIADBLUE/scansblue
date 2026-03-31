import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/app-header";
import Home from "@/pages/home";
import WebsiteAnalysis from "@/pages/website-analysis";
import Dashboard from "@/pages/dashboard";
import CodeAuditor from "@/pages/code-auditor";
import Purchase from "@/pages/purchase";
import Success from "@/pages/success";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analyze" component={WebsiteAnalysis} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/auditor" component={CodeAuditor} />
      <Route path="/purchase" component={Purchase} />
      <Route path="/success" component={Success} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppHeader />

        <main className="min-h-[calc(100vh-64px)] p-4">
          <Router />
        </main>

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;