
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { getWeeklyStats, getTasksByCategory, getProductivityTrends } from '@/utils/analytics';
import { TrendingUp, Clock, Target, Award, Calendar, BarChart3 } from 'lucide-react';

const Analytics = () => {
  const { tasks, timeBlocks, productivityStats } = useTaskContext();
  
  const weeklyStats = getWeeklyStats(tasks, timeBlocks);
  const categoryData = getTasksByCategory(tasks);
  const productivityTrends = getProductivityTrends(tasks, timeBlocks);
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(productivityStats.focusScore)}%</div>
            <p className="text-xs text-muted-foreground">
              Task completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(productivityStats.timeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productivityStats.streak}</div>
            <p className="text-xs text-muted-foreground">
              {productivityStats.streak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productivityStats.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Out of {productivityStats.totalTasks} total
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scheduled" fill="#e2e8f0" name="Scheduled" />
                  <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Productivity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#3b82f6" 
                  name="Completion Rate %" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="timeSpent" 
                  stroke="#10b981" 
                  name="Time Spent (hrs)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Priority Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { priority: 'urgent-important', label: 'Urgent & Important', color: 'bg-red-500' },
              { priority: 'urgent-notImportant', label: 'Urgent Only', color: 'bg-orange-500' },
              { priority: 'notUrgent-important', label: 'Important Only', color: 'bg-blue-500' },
              { priority: 'notUrgent-notImportant', label: 'Neither', color: 'bg-gray-500' }
            ].map(({ priority, label, color }) => {
              const count = tasks.filter(t => t.priority === priority).length;
              const percentage = tasks.length > 0 ? (count / tasks.length * 100).toFixed(1) : 0;
              
              return (
                <div key={priority} className="text-center p-4 border rounded-lg">
                  <div className={`w-12 h-12 ${color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {count}
                  </div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
