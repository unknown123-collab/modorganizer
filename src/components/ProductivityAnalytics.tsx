
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Target, Award, Brain, Zap } from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

const ProductivityAnalytics = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();

  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    // Calculate completion rates
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate recent performance (last 7 days)
    const recentTasks = tasks.filter(t => 
      t.created_at && isAfter(new Date(t.created_at), last7Days)
    );
    const recentCompleted = recentTasks.filter(t => t.completed).length;
    const recentCompletionRate = recentTasks.length > 0 ? (recentCompleted / recentTasks.length) * 100 : 0;

    // Calculate productivity streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(now, i);
      const dayStart = startOfDay(checkDate);
      const dayEnd = endOfDay(checkDate);
      
      const dayCompleted = tasks.some(t => 
        t.completed && t.updated_at && 
        isAfter(new Date(t.updated_at), dayStart) && 
        isBefore(new Date(t.updated_at), dayEnd)
      );
      
      if (dayCompleted) {
        streak++;
      } else if (i === 0) {
        break; // Today has no completed tasks
      } else {
        break; // Streak broken
      }
    }

    // Calculate time spent (clamped to avoid negative/invalid durations)
    const timeSpentMinutes = timeBlocks
      .filter(block => block.completed)
      .reduce((total, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        const safe = Number.isFinite(duration) ? Math.max(0, duration) : 0;
        return total + safe;
      }, 0);

    // Priority distribution
    const priorityDistribution = [
      { name: 'Urgent & Important', value: tasks.filter(t => t.priority === 'urgent-important').length, color: '#ef4444' },
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent-notImportant').length, color: '#f97316' },
      { name: 'Important', value: tasks.filter(t => t.priority === 'notUrgent-important').length, color: '#eab308' },
      { name: 'Normal', value: tasks.filter(t => t.priority === 'notUrgent-notImportant').length, color: '#3b82f6' }
    ];

    // Weekly productivity trend
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayTasks = tasks.filter(t => 
        t.created_at && 
        isAfter(new Date(t.created_at), dayStart) && 
        isBefore(new Date(t.created_at), dayEnd)
      );
      
      const dayCompleted = dayTasks.filter(t => t.completed).length;
      
      return {
        day: format(date, 'EEE'),
        completed: dayCompleted,
        total: dayTasks.length,
        rate: dayTasks.length > 0 ? (dayCompleted / dayTasks.length) * 100 : 0
      };
    });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      recentCompletionRate,
      streak,
      timeSpent: Math.round(timeSpentMinutes / 60), // Convert to hours
      priorityDistribution,
      weeklyTrend
    };
  }, [tasks, timeBlocks]);

  const getInsights = () => {
    const insights = [];
    
    // Completion rate insights
    if (analytics.completionRate > 80) {
      insights.push({ 
        icon: Award, 
        text: `Outstanding ${analytics.completionRate.toFixed(1)}% completion rate! You're maximizing productivity.`, 
        type: "success" 
      });
    } else if (analytics.completionRate > 60) {
      insights.push({ 
        icon: Target, 
        text: `Solid ${analytics.completionRate.toFixed(1)}% completion rate. Focus on high-priority tasks to reach 80%+.`, 
        type: "info" 
      });
    } else if (analytics.completionRate > 30) {
      insights.push({ 
        icon: Brain, 
        text: `${analytics.completionRate.toFixed(1)}% completion rate. Break large tasks into smaller steps for better progress.`, 
        type: "warning" 
      });
    } else {
      insights.push({ 
        icon: Brain, 
        text: "Low completion rate detected. Start with 2-3 small, achievable tasks today to build momentum.", 
        type: "warning" 
      });
    }

    // Streak insights
    if (analytics.streak >= 14) {
      insights.push({ 
        icon: Zap, 
        text: `Incredible ${analytics.streak}-day streak! You've built a powerful productivity habit.`, 
        type: "success" 
      });
    } else if (analytics.streak >= 7) {
      insights.push({ 
        icon: Zap, 
        text: `Great ${analytics.streak}-day streak! Consistency is key to long-term success.`, 
        type: "success" 
      });
    } else if (analytics.streak >= 3) {
      insights.push({ 
        icon: TrendingUp, 
        text: `${analytics.streak}-day streak building! Aim for 7 days to establish a habit.`, 
        type: "info" 
      });
    } else if (analytics.streak === 0 && analytics.totalTasks > 0) {
      insights.push({ 
        icon: Target, 
        text: "Complete at least one task today to start your productivity streak!", 
        type: "info" 
      });
    }

    // Time management insights
    if (analytics.timeSpent > 40) {
      insights.push({ 
        icon: Clock, 
        text: `${analytics.timeSpent} hours of focused work! Consider the 52/17 rule: 52min work, 17min break.`, 
        type: "info" 
      });
    } else if (analytics.timeSpent > 20) {
      insights.push({ 
        icon: Clock, 
        text: `${analytics.timeSpent} hours tracked. Use time blocks to improve focus and productivity.`, 
        type: "info" 
      });
    }

    // Priority-based insights
    const urgentImportant = analytics.priorityDistribution.find(p => p.name === 'Urgent & Important')?.value || 0;
    const total = analytics.totalTasks;
    
    if (urgentImportant > total * 0.3 && total > 5) {
      insights.push({ 
        icon: Brain, 
        text: "High urgent tasks detected. Focus on prevention and planning to reduce firefighting.", 
        type: "warning" 
      });
    } else if (urgentImportant === 0 && total > 3) {
      insights.push({ 
        icon: Award, 
        text: "No urgent tasks! Excellent planning and time management.", 
        type: "success" 
      });
    }

    // Weekly trend insights
    const recentDays = analytics.weeklyTrend.slice(-3);
    const avgRecentRate = recentDays.reduce((sum, day) => sum + day.rate, 0) / recentDays.length;
    
    if (avgRecentRate > analytics.completionRate + 10) {
      insights.push({ 
        icon: TrendingUp, 
        text: "Your productivity is trending upward! Keep this momentum going.", 
        type: "success" 
      });
    } else if (avgRecentRate < analytics.completionRate - 10) {
      insights.push({ 
        icon: Brain, 
        text: "Recent dip in productivity. Review your schedule and prioritize self-care.", 
        type: "warning" 
      });
    }

    return insights.slice(0, 4); // Limit to 4 most relevant insights
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Productivity Analytics</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productivity Streak</p>
                <p className="text-2xl font-bold">{analytics.streak} days</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Focused</p>
                <p className="text-2xl font-bold">{analytics.timeSpent}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold">{analytics.completedTasks}/{analytics.totalTasks}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.priorityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {analytics.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <insight.icon className="h-5 w-5 text-primary" />
                <span className="text-sm">{insight.text}</span>
                <Badge variant={insight.type === 'success' ? 'default' : insight.type === 'warning' ? 'destructive' : 'secondary'}>
                  {insight.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityAnalytics;
