import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Navigation } from "./components/Navigation";
import Dashboard from "./pages/Dashboard";

import BuyList from "./pages/BuyList";
import AdminPanel from "./pages/AdminPanel";
import Reports from "./pages/Reports";
// import Projects from "./pages/Projects"; // Removed
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            
            {/* Main Content */}
            <main className="md:ml-64 min-h-screen">
              <div className="p-6 mt-20 md:mt-0">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/buy-list" element={<BuyList />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/reports" element={<Reports />} />
                  {/* <Route path="/projects" element={<Projects />} /> Removed */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
