
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWeeklyStats } from '@/utils/analytics';

const TasksProgressCard = () => {
  const { tasks, timeBlocks } = useTaskContext();
  const weeklyStats = getWeeklyStats(tasks, timeBlocks);
  
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-medium mb-4">Weekly Progress</h3>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar name="Scheduled" dataKey="scheduled" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            <Bar name="Completed" dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TasksProgressCard;
