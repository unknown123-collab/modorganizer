
import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, BarChart, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: 'dashboard' | 'tasks' | 'calendar' | 'analytics';
  setActiveView: (view: 'dashboard' | 'tasks' | 'calendar' | 'analytics') => void;
}

const MobileNav = ({ isOpen, setIsOpen, activeView, setActiveView }: MobileNavProps) => {
  const { user } = useAuth();
  
  const handleNavigation = (view: 'dashboard' | 'tasks' | 'calendar' | 'analytics') => {
    setActiveView(view);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <h1 className="text-lg font-bold">TaskOptimizer</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] sm:w-[350px]">
            {/* User info */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg mb-6">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => handleNavigation('dashboard')}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  activeView === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('tasks')}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  activeView === 'tasks' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                }`}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                <span className="font-medium">Tasks</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('calendar')}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  activeView === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                }`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span className="font-medium">Calendar</span>
              </button>
              
              <button 
                onClick={() => handleNavigation('analytics')}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  activeView === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                }`}
              >
                <BarChart className="w-5 h-5 mr-3" />
                <span className="font-medium">Analytics</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Mobile View Title */}
      <div className="px-4 py-3 bg-muted/20 border-b">
        <h2 className="text-lg font-semibold">
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
