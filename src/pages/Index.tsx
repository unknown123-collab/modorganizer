
import React, { useState } from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';
import TaskPanel from '@/components/TaskPanel';
import Analytics from '@/components/Analytics';
import Calendar from '@/components/Calendar';
import MobileNav from '@/components/MobileNav';

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'tasks' | 'calendar' | 'analytics'>('dashboard');
  
  return (
    <TaskProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Mobile Navigation */}
        <MobileNav 
          isOpen={mobileMenuOpen} 
          setIsOpen={setMobileMenuOpen}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 lg:w-72">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'tasks' && <TaskPanel />}
            {activeView === 'calendar' && <Calendar />}
            {activeView === 'analytics' && <Analytics />}
          </div>
        </div>
      </div>
    </TaskProvider>
  );
};

export default Index;
