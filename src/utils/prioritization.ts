
import { Task } from '@/types';

// Eisenhower Matrix implementation
export const prioritizeTasks = (tasks: Task[]): Task[] => {
  // Sort by Eisenhower Matrix (urgent-important first)
  const priorityOrder = {
    'urgent-important': 1,
    'urgent-notImportant': 2,
    'notUrgent-important': 3,
    'notUrgent-notImportant': 4
  };
  
  return [...tasks].sort((a, b) => {
    // First by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by deadline (if both have deadlines)
    if (a.deadline && b.deadline) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
    
    // Tasks with deadlines come first
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    
    return 0;
  });
};

// MoSCoW method implementation
export const moscowPrioritize = (tasks: Task[]): Record<string, Task[]> => {
  const must: Task[] = [];
  const should: Task[] = [];
  const could: Task[] = [];
  const wont: Task[] = [];
  
  tasks.forEach(task => {
    if (task.priority === 'urgent-important') must.push(task);
    else if (task.priority === 'notUrgent-important') should.push(task);
    else if (task.priority === 'urgent-notImportant') could.push(task);
    else wont.push(task);
  });
  
  return { must, should, could, wont };
};

export const getHighImpactTasks = (tasks: Task[], limit = 5): Task[] => {
  return prioritizeTasks(tasks).slice(0, limit);
};
