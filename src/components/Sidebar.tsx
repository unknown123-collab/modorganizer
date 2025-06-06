
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { LayoutDashboard, CheckSquare, Calendar, BarChart, Settings, Plus } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'tasks' | 'calendar' | 'analytics';
  setActiveView: (view: 'dashboard' | 'tasks' | 'calendar' | 'analytics') => void;
}

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const { productivityStats, tasks, getPriorityTasks } = useTaskContext();
  const priorityTasks = getPriorityTasks(3);
  
  return (
    <div className="w-full h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      <div className="p-5">
        <h1 className="text-xl font-bold">TaskOptimizer</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex items-center w-full px-3 py-2 rounded-md ${
            activeView === 'dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          <span>Dashboard</span>
        </button>
        
        <button 
          onClick={() => setActiveView('tasks')}
          className={`flex items-center w-full px-3 py-2 rounded-md ${
            activeView === 'tasks' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
          }`}
        >
          <CheckSquare className="w-5 h-5 mr-3" />
          <span>Tasks</span>
        </button>
        
        <button 
          onClick={() => setActiveView('calendar')}
          className={`flex items-center w-full px-3 py-2 rounded-md ${
            activeView === 'calendar' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
          }`}
        >
          <Calendar className="w-5 h-5 mr-3" />
          <span>Calendar</span>
        </button>
        
        <button 
          onClick={() => setActiveView('analytics')}
          className={`flex items-center w-full px-3 py-2 rounded-md ${
            activeView === 'analytics' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
          }`}
        >
          <BarChart className="w-5 h-5 mr-3" />
          <span>Analytics</span>
        </button>
      </nav>
      
      {/* Stats */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-2 text-sm font-medium">Progress</div>
        <div className="w-full h-2 bg-sidebar-accent rounded-full">
          <div 
            className="h-2 bg-sidebar-primary rounded-full" 
            style={{ width: `${productivityStats.tasksCompleted / (productivityStats.totalTasks || 1) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs">
          {productivityStats.tasksCompleted}/{productivityStats.totalTasks} tasks completed
        </div>
        
        {/* Streak */}
        {productivityStats.streak > 0 && (
          <div className="mt-3 text-xs flex items-center">
            <span className="text-sidebar-primary mr-2">🔥</span> 
            <span>{productivityStats.streak} day streak</span>
          </div>
        )}
      </div>
      
      {/* Priority Tasks */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Priority Tasks</span>
          <button 
            className="text-xs text-sidebar-primary hover:underline"
            onClick={() => setActiveView('tasks')}
          >
            View All
          </button>
        </div>
        
        <div className="space-y-2">
          {priorityTasks.length > 0 ? (
            priorityTasks.map(task => (
              <div key={task.id} className="text-xs truncate">
                • {task.title}
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No priority tasks</div>
          )}
        </div>
      </div>
      
      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center text-sm w-full hover:text-sidebar-primary">
          <Settings className="w-4 h-4 mr-2" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
