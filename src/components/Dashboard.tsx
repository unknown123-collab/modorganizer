
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import EnhancedTaskInput from './EnhancedTaskInput';
import PriorityTasksCard from './PriorityTasksCard';
import ProductivityStatsCard from './ProductivityStatsCard';
import TasksProgressCard from './TasksProgressCard';
import TipsCard from './TipsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, Sparkles, LogOut, User, Trophy, Target, Zap, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { tasks } = useSupabaseTasks();
  useTheme();

  const setTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  const getCurrentTheme = () => {
    return localStorage.getItem('theme') || 'system';
  };
  
  // Calculate recent achievements
  const completedTasks = tasks.filter(t => t.completed).length;
  const recentAchievements = [];
  
  if (completedTasks >= 1 && completedTasks < 2) {
    recentAchievements.push({ title: 'First Steps', description: 'Completed your first task!', icon: Target });
  }
  if (completedTasks >= 10 && completedTasks < 11) {
    recentAchievements.push({ title: 'Task Master', description: 'Completed 10 tasks!', icon: Trophy });
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={getCurrentTheme()} onValueChange={setTheme}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getCurrentTheme() === 'light' && <Sun className="h-4 w-4" />}
                  {getCurrentTheme() === 'dark' && <Moon className="h-4 w-4" />}
                  {getCurrentTheme() === 'system' && <Monitor className="h-4 w-4" />}
                  <span className="capitalize">
                    {getCurrentTheme() === 'light' ? 'Light' : 
                     getCurrentTheme() === 'dark' ? 'Dark' : 'System'}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/settings'}
            className="flex items-center gap-2 justify-center min-h-[40px]"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="flex items-center gap-2 justify-center text-muted-foreground hover:text-destructive min-h-[40px]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{tasks.length}</div>
            <div className="text-xs sm:text-sm opacity-90">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white dark:from-emerald-600 dark:to-emerald-700">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{tasks.filter(t => t.completed).length}</div>
            <div className="text-xs sm:text-sm opacity-90">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white dark:from-amber-600 dark:to-amber-700">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-xs sm:text-sm opacity-90">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white dark:from-violet-600 dark:to-violet-700">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
            </div>
            <div className="text-xs sm:text-sm opacity-90">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg shadow-sm">
                  <achievement.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm text-card-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">New!</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Task Input */}
      <EnhancedTaskInput />
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <PriorityTasksCard />
        </div>
        <div className="lg:col-span-1">
          <ProductivityStatsCard />
        </div>
        <div className="lg:col-span-1">
          <TipsCard />
        </div>
      </div>
      
      {/* Progress Overview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-semibold">Tasks Progress</h2>
        </div>
        <TasksProgressCard />
      </div>
    </div>
  );
};

export default Dashboard;
