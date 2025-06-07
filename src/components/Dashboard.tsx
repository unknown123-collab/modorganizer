
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import EnhancedTaskInput from './EnhancedTaskInput';
import PriorityTasksCard from './PriorityTasksCard';
import ProductivityStatsCard from './ProductivityStatsCard';
import TasksProgressCard from './TasksProgressCard';
import TipsCard from './TipsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutGrid, Sparkles, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { tasks } = useSupabaseTasks();
  
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
