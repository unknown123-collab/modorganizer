
import React from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';

const ProductivityStatsCard = () => {
  const { tasks } = useSupabaseTasks();
  
  // Calculate basic productivity stats from Supabase tasks
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const focusScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate estimated time spent (sum of completed tasks' time estimates)
  const timeSpent = tasks
    .filter(task => task.completed && task.time_estimate)
    .reduce((total, task) => total + (task.time_estimate || 0), 0);
  
  // Simple streak calculation (for now, just show 1 if any tasks completed, 0 otherwise)
  const streak = completedTasks > 0 ? 1 : 0;
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Productivity Stats</h2>
      
      <div className="space-y-4">
        {/* Focus Score */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Focus Score</span>
            <span className="text-sm font-medium">{focusScore}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full">
            <div 
              className="h-2 bg-primary rounded-full" 
              style={{ width: `${focusScore}%` }}
            />
          </div>
        </div>
        
        {/* Tasks Completed */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Tasks Completed</span>
          <span className="text-sm font-medium">{completedTasks}/{totalTasks}</span>
        </div>
        
        {/* Time Spent */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Time Spent</span>
          <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
        </div>
        
        {/* Daily Streak */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Daily Streak</span>
          <span className="text-sm font-medium">
            {streak} {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityStatsCard;
