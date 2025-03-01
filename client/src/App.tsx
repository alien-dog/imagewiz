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
import Pricing from "@/pages/pricing"; // Added import for Pricing page

// Resource Pages
import UseCases from "@/pages/resources/use-cases";
import Guides from "@/pages/resources/guides";
import Blog from "@/pages/resources/blog";

// Individual Articles
// Use Cases
import EcommerceUseCase from "@/pages/resources/use-cases/ecommerce";
import PhotographyUseCase from "@/pages/resources/use-cases/photography";
import MarketingUseCase from "@/pages/resources/use-cases/marketing";
import GraphicDesignUseCase from "@/pages/resources/use-cases/graphic-design";

// Guides
import GettingStartedGuide from "@/pages/resources/guides/getting-started";
import AdvancedTechniquesGuide from "@/pages/resources/guides/advanced-techniques";
import BestPracticesGuide from "@/pages/resources/guides/best-practices";
import ApiIntegrationGuide from "@/pages/resources/guides/api-integration";

// Blog Posts
import AIFutureImageProcessing from "@/pages/resources/blog/ai-future-image-processing";
import EcommerceOptimization from "@/pages/resources/blog/ecommerce-optimization";
import SustainabilityDesign from "@/pages/resources/blog/sustainability-design";
import ProcessingTrends from "@/pages/resources/blog/processing-trends";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={Pricing} />

      {/* Resource Pages */}
      <Route path="/resources/use-cases" component={UseCases} />
      <Route path="/resources/guides" component={Guides} />
      <Route path="/resources/blog" component={Blog} />

      {/* Use Cases */}
      <Route path="/resources/use-cases/ecommerce" component={EcommerceUseCase} />
      <Route path="/resources/use-cases/photography" component={PhotographyUseCase} />
      <Route path="/resources/use-cases/marketing" component={MarketingUseCase} />
      <Route path="/resources/use-cases/graphic-design" component={GraphicDesignUseCase} />

      {/* Guides */}
      <Route path="/resources/guides/getting-started" component={GettingStartedGuide} />
      <Route path="/resources/guides/advanced-techniques" component={AdvancedTechniquesGuide} />
      <Route path="/resources/guides/best-practices" component={BestPracticesGuide} />
      <Route path="/resources/guides/api-integration" component={ApiIntegrationGuide} />

      {/* Blog Posts */}
      <Route path="/resources/blog/ai-future-image-processing" component={AIFutureImageProcessing} />
      <Route path="/resources/blog/ecommerce-optimization" component={EcommerceOptimization} />
      <Route path="/resources/blog/sustainability-design" component={SustainabilityDesign} />
      <Route path="/resources/blog/processing-trends" component={ProcessingTrends} />

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