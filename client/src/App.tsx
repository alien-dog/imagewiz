import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/dashboard/profile";
import ImageHistory from "@/pages/dashboard/image-history";
import Credits from "@/pages/dashboard/credits";
import Settings from "@/pages/dashboard/settings";
import UseCases from "@/pages/resources/use-cases";
import Guides from "@/pages/resources/guides";
import Blog from "@/pages/resources/blog";
import AdminDashboard from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/resources/use-cases" component={UseCases} />
      <Route path="/resources/guides" component={Guides} />
      <Route path="/resources/blog" component={Blog} />
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