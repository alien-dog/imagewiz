import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Helmet } from "react-helmet";

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
import Pricing from "@/pages/pricing";

// Resource Pages
import UseCases from "@/pages/resources/use-cases";
import Guides from "@/pages/resources/guides";
import Blog from "@/pages/resources/blog";

function Router() {
  return (
    <>
      <Helmet>
        <title>iMagenWiz - AI image background removal</title>
        <meta
          name="description"
          content="iMagenWiz is an advanced AI-powered platform for removing image backgrounds instantly. Perfect for professionals and creators."
        />
      </Helmet>
      <Switch>
        {/* Public Routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/resources/use-cases" component={UseCases} />
        <Route path="/resources/guides" component={Guides} />
        <Route path="/resources/blog" component={Blog} />

        {/* Protected Routes */}
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/dashboard/profile" component={Profile} />
        <ProtectedRoute path="/dashboard/history" component={ImageHistory} />
        <ProtectedRoute path="/dashboard/credits" component={Credits} />
        <ProtectedRoute path="/dashboard/settings" component={Settings} />
        <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />

        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
    </>
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