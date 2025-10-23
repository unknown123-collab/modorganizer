
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import EnhancedTaskInput from './EnhancedTaskInput';
import PriorityTasksCard from './PriorityTasksCard';
import ProductivityStatsCard from './ProductivityStatsCard';
import TasksProgressCard from './TasksProgressCard';
import GamificationCard from './GamificationCard';
import TipsCard from './TipsCard';
import CategoryManager from './CategoryManager';
import { NotificationSystem } from './NotificationSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Sparkles, LogOut, User, Trophy, Target } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { tasks } = useSupabaseTasks();

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
      {/* Header with Stats */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Top Row: Dashboard Title and Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          
          <div className="flex flex-row items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/settings'}
              className="flex items-center gap-2 justify-center min-h-[40px]"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="flex items-center gap-2 justify-center text-muted-foreground hover:text-destructive min-h-[40px]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-primary text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold">{tasks.length}</div>
              <div className="text-sm opacity-90">Total Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-accent text-accent-foreground border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold">{tasks.filter(t => t.completed).length}</div>
              <div className="text-sm opacity-90">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold">{tasks.filter(t => !t.completed).length}</div>
              <div className="text-sm opacity-90">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-secondary-foreground border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="text-2xl sm:text-3xl font-bold">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
              </div>
              <div className="text-sm opacity-90">Completion Rate</div>
            </CardContent>
          </Card>
        </div>
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

      {/* Notification System - runs in background to show toast notifications */}
      <NotificationSystem />
      
      {/* Task Input */}
      <EnhancedTaskInput />
      
      {/* Category Management */}
      <CategoryManager />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <PriorityTasksCard />
        </div>
        <div className="lg:col-span-1">
          <ProductivityStatsCard />
        </div>
        <div className="lg:col-span-1">
          <GamificationCard />
        </div>
      </div>
      
      {/* Tips Section */}
      <TipsCard />
      
        {/* Progress Overview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Tasks Progress</h2>
          </div>
          <TasksProgressCard />
        </div>
    </div>
  );
};

export default Dashboard;
