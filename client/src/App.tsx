import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/dashboard/profile";
import ImageHistory from "@/pages/dashboard/image-history";
import Credits from "@/pages/dashboard/credits";
import Settings from "@/pages/dashboard/settings";
import AdminDashboard from "@/pages/admin";
import NotFound from "@/pages/not-found";

// Resource Pages
import UseCases from "@/pages/resources/use-cases";
import Guides from "@/pages/resources/guides";
import Blog from "@/pages/resources/blog";

// Individual Articles
import EcommerceUseCase from "@/pages/resources/use-cases/ecommerce";
import GettingStartedGuide from "@/pages/resources/guides/getting-started";
import AIFutureImageProcessing from "@/pages/resources/blog/ai-future-image-processing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />

      {/* Resource Pages */}
      <Route path="/resources/use-cases" component={UseCases} />
      <Route path="/resources/guides" component={Guides} />
      <Route path="/resources/blog" component={Blog} />

      {/* Individual Articles */}
      <Route path="/resources/use-cases/ecommerce" component={EcommerceUseCase} />
      <Route path="/resources/guides/getting-started" component={GettingStartedGuide} />
      <Route path="/resources/blog/ai-future-image-processing" component={AIFutureImageProcessing} />

      {/* Dashboard Routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard/profile" component={Profile} />
      <ProtectedRoute path="/dashboard/history" component={ImageHistory} />
      <ProtectedRoute path="/dashboard/credits" component={Credits} />
      <ProtectedRoute path="/dashboard/settings" component={Settings} />
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;