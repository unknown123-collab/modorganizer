
import React from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TasksProgressCard = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();
  
  // Generate weekly stats from Supabase data
  const getWeeklyStats = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
    
    return days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      // Count tasks scheduled for this day (using time blocks)
      const scheduledForDay = timeBlocks.filter(block => {
        const blockDate = new Date(block.start_time);
        return blockDate.toDateString() === dayDate.toDateString();
      }).length;
      
      // Count completed tasks for this day
      const completedForDay = tasks.filter(task => {
        if (!task.completed) return false;
        const taskDate = new Date(task.updated_at);
        return taskDate.toDateString() === dayDate.toDateString();
      }).length;
      
      return {
        day,
        scheduled: scheduledForDay,
        completed: completedForDay
      };
    });
  };
  
  const weeklyStats = getWeeklyStats();
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-3 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-blue-500">Completed: {payload[1]?.value || 0} tasks</p>
          <p className="text-slate-400">Scheduled: {payload[0]?.value || 0} tasks</p>
          <p className="text-xs text-muted-foreground mt-1">
            Completion Rate: {Math.round(((payload[1]?.value || 0) / ((payload[0]?.value || 1))) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium">Weekly Progress</h3>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar name="Scheduled" dataKey="scheduled" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar name="Completed" dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksProgressCard;
