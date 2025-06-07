
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';
import EnhancedTaskPanel from '@/components/EnhancedTaskPanel';
import Analytics from '@/components/Analytics';
import EnhancedCalendar from '@/components/EnhancedCalendar';
import MobileNav from '@/components/MobileNav';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'calendar' | 'analytics'>('dashboard');
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col md:flex-row">
      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={mobileMenuOpen} 
        setIsOpen={setMobileMenuOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 lg:w-72 shadow-xl">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'tasks' && <EnhancedTaskPanel />}
          {activeView === 'calendar' && <EnhancedCalendar />}
          {activeView === 'analytics' && <Analytics />}
        </div>
      </div>
    </div>
  );
};

export default Index;
