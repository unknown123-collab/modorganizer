
import { Task, TimeBlock, UserSettings } from '@/types';
import { prioritizeTasks } from './prioritization';
import { getPhilippineNow, fromPhilippineTime } from './timezone';

export const createSchedule = (
  tasks: Task[], 
  settings: UserSettings,
  existingBlocks: TimeBlock[] = []
): TimeBlock[] => {
  // Get prioritized tasks
  const prioritizedTasks = prioritizeTasks(tasks).filter(t => !t.completed);
  
  // Current date for scheduling in Philippine timezone
  let currentDate = getPhilippineNow();
  currentDate.setHours(parseInt(settings.workHours.start.split(':')[0], 10));
  currentDate.setMinutes(parseInt(settings.workHours.start.split(':')[1], 10));
  
  // End of work day
  const endHour = parseInt(settings.workHours.end.split(':')[0], 10);
  const endMinute = parseInt(settings.workHours.end.split(':')[1], 10);
  
  const schedule: TimeBlock[] = [...existingBlocks];
  
  // Create blocks for tasks
  for (const task of prioritizedTasks) {
    // Skip tasks that are already scheduled
    if (schedule.some(block => block.taskId === task.id)) continue;
    
    // Ensure we're within work hours
    if (!settings.workDays.includes(currentDate.getDay())) {
      // Move to next work day
      do {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(parseInt(settings.workHours.start.split(':')[0], 10));
        currentDate.setMinutes(parseInt(settings.workHours.start.split(':')[1], 10));
      } while (!settings.workDays.includes(currentDate.getDay()));
    }
    
    const taskDuration = task.timeEstimate || 30; // Default 30 minutes
    
    // Check if we need to move to next day
    const blockEndTime = new Date(currentDate);
    blockEndTime.setMinutes(blockEndTime.getMinutes() + taskDuration);
    
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(endHour);
    endOfDay.setMinutes(endMinute);
    
    if (blockEndTime > endOfDay) {
      // Move to next work day
      do {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(parseInt(settings.workHours.start.split(':')[0], 10));
        currentDate.setMinutes(parseInt(settings.workHours.start.split(':')[1], 10));
      } while (!settings.workDays.includes(currentDate.getDay()));
    }
    
    // Create the time block (convert to UTC for consistency)
    const startUTC = fromPhilippineTime(new Date(currentDate));
    const endUTC = fromPhilippineTime(new Date(currentDate.getTime() + taskDuration * 60000));
    
    const timeBlock: TimeBlock = {
      id: `block-${Date.now()}-${task.id}`,
      taskId: task.id,
      start: startUTC,
      end: endUTC,
      completed: false
    };
    
    schedule.push(timeBlock);
    
    // Move current time forward
    currentDate = new Date(timeBlock.end.getTime() + settings.breakTime * 60000);
  }
  
  return schedule;
};

export const getCalendarEvents = (timeBlocks: TimeBlock[], tasks: Task[]): any[] => {
  return timeBlocks.map(block => {
    const task = tasks.find(t => t.id === block.taskId);
    return {
      title: task?.title || 'Unknown Task',
      start: block.start,
      end: block.end,
      completed: block.completed,
      id: block.id,
      priority: task?.priority
    };
  });
};
