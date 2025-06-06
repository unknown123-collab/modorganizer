
import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, BarChart, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: 'dashboard' | 'tasks' | 'calendar' | 'analytics';
  setActiveView: (view: 'dashboard' | 'tasks' | 'calendar' | 'analytics') => void;
}

const MobileNav = ({ isOpen, setIsOpen, activeView, setActiveView }: MobileNavProps) => {
  const handleNavigation = (view: 'dashboard' | 'tasks' | 'calendar' | 'analytics') => {
    setActiveView(view);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b">
        <h1 className="text-lg font-bold">TaskOptimizer</h1>
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] sm:w-[350px]">
            <nav className="flex flex-col gap-4 mt-6">
              <button 
                onClick={() => handleNavigation('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeView === 'dashboard' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('tasks')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeView === 'tasks' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                }`}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                <span>Tasks</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('calendar')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeView === 'calendar' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                }`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span>Calendar</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('analytics')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeView === 'analytics' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                }`}
              >
                <BarChart className="w-5 h-5 mr-3" />
                <span>Analytics</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Mobile View Title */}
      <div className="px-4 py-2 bg-muted/30">
        <h2 className="text-base font-medium">
          {activeView === 'dashboard' && 'Dashboard'}
          {activeView === 'tasks' && 'Tasks'}
          {activeView === 'calendar' && 'Calendar'}
          {activeView === 'analytics' && 'Analytics'}
        </h2>
      </div>
    </div>
  );
};

export default MobileNav;
