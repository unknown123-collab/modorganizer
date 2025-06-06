
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getWeeklyStats } from '@/utils/analytics';

const TasksProgressCard = () => {
  const { tasks, timeBlocks } = useTaskContext();
  const weeklyStats = getWeeklyStats(tasks, timeBlocks);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-3 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-blue-500">Completed: {payload[1].value} tasks</p>
          <p className="text-slate-400">Scheduled: {payload[0].value} tasks</p>
          <p className="text-xs text-muted-foreground mt-1">
            Completion Rate: {Math.round((payload[1].value / (payload[0].value || 1)) * 100)}%
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
