
import React from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, CheckSquare, Calendar, BarChart, Settings, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeView: 'dashboard' | 'tasks' | 'calendar' | 'analytics';
  setActiveView: (view: 'dashboard' | 'tasks' | 'calendar' | 'analytics') => void;
}

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const { user } = useAuth();
  const { tasks } = useSupabaseTasks();
  const navigate = useNavigate();
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 border-r border-border flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">TaskOptimizer</h1>
            <p className="text-xs text-muted-foreground">Pro</p>
          </div>
        </div>
        
        {/* User info */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeView === 'dashboard' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          <span className="font-medium">Dashboard</span>
        </button>
        
        <button 
          onClick={() => setActiveView('tasks')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeView === 'tasks' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50'
          }`}
        >
          <CheckSquare className="w-5 h-5 mr-3" />
          <span className="font-medium">Tasks</span>
          {totalTasks > 0 && (
            <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              {totalTasks}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => setActiveView('calendar')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeView === 'calendar' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50'
          }`}
        >
          <Calendar className="w-5 h-5 mr-3" />
          <span className="font-medium">Calendar</span>
        </button>
        
        <button 
          onClick={() => setActiveView('analytics')}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
            activeView === 'analytics' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50'
          }`}
        >
          <BarChart className="w-5 h-5 mr-3" />
          <span className="font-medium">Analytics</span>
        </button>
      </nav>
      
      {/* Progress Stats */}
      <div className="p-4 border-t border-border">
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {completedTasks}/{totalTasks} tasks completed
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center text-sm w-full px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Settings className="w-4 h-4 mr-3" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
