import React, { useMemo } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  Calendar,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Brain,
  Zap,
  Timer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { RealTimeAnalytics } from './RealTimeAnalytics';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { EnhancedTimeTracking } from './EnhancedTimeTracking';

const AdvancedAnalytics = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();

  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(now, 29 - i));

    // Daily completion trends
    const dailyCompletions = last7Days.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const completedTasks = tasks.filter(task => 
        task.completed && 
        task.updated_at &&
        isWithinInterval(new Date(task.updated_at), { start: dayStart, end: dayEnd })
      );

      return {
        date: format(date, 'MMM dd'),
        completed: completedTasks.length,
        dayOfWeek: format(date, 'EEE')
      };
    });

    // Priority distribution
    const priorityData = [
      { name: 'Urgent & Important', value: tasks.filter(t => t.priority === 'urgent-important').length, color: '#ef4444' },
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent-notImportant').length, color: '#f97316' },
      { name: 'Important', value: tasks.filter(t => t.priority === 'notUrgent-important').length, color: '#eab308' },
      { name: 'Normal', value: tasks.filter(t => t.priority === 'notUrgent-notImportant').length, color: '#3b82f6' }
    ];

    // Weekly focus time analysis
    const weeklyFocusData = last7Days.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayBlocks = timeBlocks.filter(block => 
        isWithinInterval(new Date(block.start_time), { start: dayStart, end: dayEnd })
      );

      const totalMinutes = dayBlocks.reduce((total, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        return total + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);

      const completedMinutes = dayBlocks.filter(b => b.completed).reduce((total, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        return total + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);

      return {
        day: format(date, 'EEE'),
        planned: Math.round(totalMinutes),
        completed: Math.round(completedMinutes),
        efficiency: totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0
      };
    });

    // Task completion rate by category
    const categories = [...new Set(tasks.map(t => {
        const categoryId = t.category_id;
        return categoryId ? categoryId : null;
      }).filter(Boolean))];
    const categoryData = categories.map(categoryId => {
      const categoryTasks = tasks.filter(t => t.category_id === categoryId);
      const completed = categoryTasks.filter(t => t.completed).length;
      
      return {
        category: `Category ${String(categoryId).slice(-4)}`,
        total: categoryTasks.length,
        completed,
        rate: categoryTasks.length > 0 ? Math.round((completed / categoryTasks.length) * 100) : 0
      };
    });

    // Productivity patterns
    const completedTasks = tasks.filter(t => t.completed);
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((acc, task) => acc + (task.time_estimate || 30), 0) / completedTasks.length 
      : 0;

    const overdueTasks = tasks.filter(t => 
      !t.completed && 
      t.deadline && 
      new Date(t.deadline) < now
    ).length;

    const upcomingDeadlines = tasks.filter(t => 
      !t.completed && 
      t.deadline && 
      new Date(t.deadline) > now &&
      new Date(t.deadline) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      dailyCompletions,
      priorityData,
      weeklyFocusData,
      categoryData,
      stats: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
        avgCompletionTime: Math.round(avgCompletionTime),
        overdueTasks,
        upcomingDeadlines,
        totalFocusTime: Math.round(timeBlocks.reduce((total, block) => {
          const start = new Date(block.start_time);
          const end = new Date(block.end_time);
          return total + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0) / 60)
      }
    };
  }, [tasks, timeBlocks]);

  return (
    <div className="space-y-6">
      {/* Real-time Analytics */}
      <RealTimeAnalytics />
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.stats.completionRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={analytics.stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Focus Time</p>
                <p className="text-2xl font-bold">{analytics.stats.totalFocusTime}h</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold">{analytics.stats.overdueTasks}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Task Time</p>
                <p className="text-2xl font-bold">{analytics.stats.avgCompletionTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Time Tracking */}
      <EnhancedTimeTracking />
      
      {/* Performance Optimizer */}
      <PerformanceOptimizer />
      
      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="focus">Focus Time</TabsTrigger>
          <TabsTrigger value="priority">Priority Mix</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Completion Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyCompletions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Weekly Focus Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyFocusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="planned" fill="hsl(var(--muted))" name="Planned (min)" />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Task Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {analytics.priorityData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryData.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <Badge variant="outline">
                        {category.completed}/{category.total} ({category.rate}%)
                      </Badge>
                    </div>
                    <Progress value={category.rate} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;