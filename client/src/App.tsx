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
import NotFound from "@/pages/not-found";

// Import the new Button component
import { Button } from "@/components/ui/button";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analyze" component={WebsiteAnalysis} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/auditor" component={CodeAuditor} />
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

          {/* Example usage of the new Buttons anywhere in your app */}
          <div className="mt-4 flex gap-4">
            <Button variant="triadBlue" data-testid="button-submit">
              Submit
            </Button>
            <Button variant="triadBlue" data-testid="button-send">
              Send
            </Button>
            <Button variant="redNav">New Chat</Button>
            <Button variant="redNav">Attach</Button>
            <Button variant="redNav">Voice</Button>
          </div>
        </main>

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;