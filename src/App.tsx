import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VieweoAuthProvider } from "@/contexts/VieweoAuthContext";
import { VieweoProtectedRoute } from "@/components/VieweoProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import VieweoDashboard from "./pages/VieweoDashboard";
import SubscriptionPage from "./pages/SubscriptionPage";
import Methodology from "./pages/Methodology";
import Import from "./pages/Import";
import Auth from "./pages/Auth";
import AIVisibility from "./pages/AIVisibility";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <VieweoAuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/cre-dashboard" element={<Dashboard />} />
            <Route path="/vieweo" element={<VieweoDashboard />} />
            <Route path="/subscribe" element={<SubscriptionPage />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai-visibility" element={<AIVisibility />} />
            <Route
              path="/import"
              element={
                <ProtectedRoute requireAdmin>
                  <Import />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </VieweoAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
