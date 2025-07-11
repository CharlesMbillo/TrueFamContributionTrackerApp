import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MobileFrame from "@/components/mobile-frame";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Settings from "@/pages/settings";
import Logs from "@/pages/logs";
import NotFound from "@/pages/not-found";
import { queryClient } from "@/lib/queryClient";

function Home() {
  return <Dashboard />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileFrame>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/settings" component={Settings} />
          <Route path="/logs" component={Logs} />
          <Route component={NotFound} />
        </Switch>
      </MobileFrame>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
