
import { Task, TimeBlock, ProductivityStats } from '@/types';

export const calculateProductivityStats = (
  tasks: Task[], 
  timeBlocks: TimeBlock[], 
  days = 7
): ProductivityStats => {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days);
  
  // Filter tasks and blocks within the time range
  const recentTasks = tasks.filter(task => 
    task.createdAt >= startDate || 
    (task.deadline && task.deadline >= startDate)
  );
  
  const recentBlocks = timeBlocks.filter(block => 
    block.start >= startDate
  );
  
  const tasksCompleted = recentTasks.filter(t => t.completed).length;
  const totalTasks = recentTasks.length;
  
  // Calculate time spent (in minutes)
  const timeSpent = recentBlocks.reduce((total, block) => {
    if (block.completed) {
      const duration = (block.end.getTime() - block.start.getTime()) / 60000;
      return total + duration;
    }
    return total;
  }, 0);
  
  // Calculate focus score (0-100%)
  // Based on task completion rate and estimated vs. actual time spent
  const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  
  // Calculate streak (consecutive days with completed tasks)
  let streak = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);
    
    // Check if any task was completed on this date
    const hasCompletedTask = recentBlocks.some(block => {
      if (!block.completed) return false;
      
      const blockDate = new Date(block.end);
      return blockDate.getDate() === checkDate.getDate() && 
             blockDate.getMonth() === checkDate.getMonth() && 
             blockDate.getFullYear() === checkDate.getFullYear();
    });
    
    if (hasCompletedTask) {
      streak++;
    } else if (i > 0) { // Only break streak if we're checking past days
      break;
    }
  }
  
  return {
    tasksCompleted,
    totalTasks,
    timeSpent,
    focusScore: completionRate, // Simplified focus score
    streak
  };
};

export const generateProductivityTips = (stats: ProductivityStats): string[] => {
  const tips: string[] = [];
  
  if (stats.focusScore < 50) {
    tips.push('Try using the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.');
    tips.push('Consider scheduling fewer tasks per day to improve your completion rate.');
  }
  
  if (stats.tasksCompleted < stats.totalTasks * 0.3) {
    tips.push('Break down larger tasks into smaller, manageable chunks.');
    tips.push('Start your day with your most important task (MIT).');
  }
  
  if (stats.streak < 3) {
    tips.push('Build momentum by completing at least one task every day.');
    tips.push('Set a daily minimal goal that you can achieve even on busy days.');
  }
  
  if (tips.length === 0) {
    tips.push('Great work! Keep up your productive habits.');
    tips.push('Consider increasing your challenge by taking on more complex tasks.');
  }
  
  return tips;
};

export const getWeeklyStats = (
  tasks: Task[], 
  timeBlocks: TimeBlock[]
): {day: string; completed: number; scheduled: number}[] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const stats = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const dayBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.start);
      return blockDate.getDate() === date.getDate() && 
             blockDate.getMonth() === date.getMonth() && 
             blockDate.getFullYear() === date.getFullYear();
    });
    
    const completed = dayBlocks.filter(block => block.completed).length;
    const scheduled = dayBlocks.length;
    
    stats.push({
      day: days[date.getDay()],
      completed,
      scheduled
    });
  }
  
  return stats;
};

export const getTasksByCategory = (tasks: Task[]): {name: string; value: number}[] => {
  const categoryMap = new Map<string, number>();
  
  tasks.forEach(task => {
    const category = task.category || 'Uncategorized';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });
  
  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value
  }));
};

export const getProductivityTrends = (
  tasks: Task[], 
  timeBlocks: TimeBlock[], 
  days = 14
): {date: string; completionRate: number; timeSpent: number}[] => {
  const today = new Date();
  const trends = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const dayBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.start);
      return blockDate.getDate() === date.getDate() && 
             blockDate.getMonth() === date.getMonth() && 
             blockDate.getFullYear() === date.getFullYear();
    });
    
    const completed = dayBlocks.filter(block => block.completed).length;
    const scheduled = dayBlocks.length;
    const completionRate = scheduled > 0 ? (completed / scheduled) * 100 : 0;
    
    const timeSpent = dayBlocks.reduce((total, block) => {
      if (block.completed) {
        const duration = (block.end.getTime() - block.start.getTime()) / 60000;
        return total + duration;
      }
      return total;
    }, 0) / 60; // Convert to hours
    
    trends.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completionRate: Math.round(completionRate),
      timeSpent: Math.round(timeSpent * 10) / 10 // Round to 1 decimal
    });
  }
  
  return trends;
};
