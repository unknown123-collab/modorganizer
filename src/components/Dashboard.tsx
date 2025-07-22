
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={getCurrentTheme()} onValueChange={setTheme}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-sm opacity-90">Total Tasks</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasks.filter(t => t.completed).length}</div>
            <div className="text-sm opacity-90">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-sm opacity-90">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
            </div>
            <div className="text-sm opacity-90">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border">
                  <achievement.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  <Badge variant="secondary">New!</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Task Input */}
      <EnhancedTaskInput />
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PriorityTasksCard />
        <ProductivityStatsCard />
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <TipsCard />
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Tasks Progress</h2>
        </div>
        <TasksProgressCard />
      </div>
    </div>
  );
};

export default Dashboard;
