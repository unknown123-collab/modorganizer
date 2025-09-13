
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import Archive from "./pages/Archive";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";

const queryClient = new QueryClient();

const AppLayout = () => {
  const [activeView, setActiveView] = React.useState<'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'archive'>('dashboard');
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 flex flex-col">
        <MobileNav 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return session ? <AppLayout /> : <Navigate to="/auth" replace />;
};

const PublicRoute = () => {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return session ? <Navigate to="/" replace /> : <Outlet />;
};

const AppContent = () => {
  useTheme();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/archive" element={<Archive />} />
        </Route>
        <Route element={<PublicRoute />}>
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
