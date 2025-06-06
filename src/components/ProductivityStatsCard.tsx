
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';

const ProductivityStatsCard = () => {
  const { productivityStats } = useTaskContext();
  
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
            <span className="text-sm font-medium">{Math.round(productivityStats.focusScore)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full">
            <div 
              className="h-2 bg-primary rounded-full" 
              style={{ width: `${productivityStats.focusScore}%` }}
            />
          </div>
        </div>
        
        {/* Tasks Completed */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Tasks Completed</span>
          <span className="text-sm font-medium">{productivityStats.tasksCompleted}/{productivityStats.totalTasks}</span>
        </div>
        
        {/* Time Spent */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Time Spent</span>
          <span className="text-sm font-medium">{formatTime(productivityStats.timeSpent)}</span>
        </div>
        
        {/* Daily Streak */}
        <div className="flex justify-between items-center">
          <span className="text-sm">Daily Streak</span>
          <span className="text-sm font-medium">
            {productivityStats.streak} {productivityStats.streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityStatsCard;
