import { useState, useEffect, useMemo } from 'react';
import { useSupabaseTasks } from './useSupabaseTasks';

interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'completion' | 'streak' | 'time' | 'efficiency';
  points: number;
}

interface UserStats {
  totalPoints: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  timeSpent: number;
  efficiency: number;
}

export const useGamification = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    tasksCompleted: 0,
    timeSpent: 0,
    efficiency: 0,
  });

  // Calculate user statistics
  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed);
    const totalTasks = tasks.length;
    
    // Calculate streak (consecutive days with completed tasks)
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (currentDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const tasksCompletedOnDay = completedTasks.filter(task => 
        task.updated_at && 
        new Date(task.updated_at) >= dayStart && 
        new Date(task.updated_at) <= dayEnd
      );
      
      if (tasksCompletedOnDay.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate time spent (ensure no negative values)
    const timeSpent = Math.max(0, timeBlocks
      .filter(block => block.completed)
      .reduce((total, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        return total + Math.max(0, duration); // Prevent negative durations
      }, 0));

    // Calculate efficiency
    const efficiency = totalTasks > 0 ? Math.max(0, Math.min(100, (completedTasks.length / totalTasks) * 100)) : 0;

    // Calculate points and level (ensure positive values)
    const basePoints = (completedTasks.length * 10) + (Math.max(0, streak) * 5) + Math.floor(timeSpent / 60 * 2);
    const points = Math.max(0, basePoints);
    const level = Math.max(1, Math.floor(points / 100) + 1);

    setUserStats({
      totalPoints: points,
      level,
      streak,
      tasksCompleted: completedTasks.length,
      timeSpent,
      efficiency,
    });
  }, [tasks, timeBlocks]);

  // Generate achievements
  const achievements = useMemo((): Achievement[] => {
    const { tasksCompleted, streak, timeSpent, efficiency } = userStats;

    return [
      // Completion achievements
      {
        id: 'first_task',
        title: 'Getting Started',
        description: 'Complete your first task',
        achieved: tasksCompleted >= 1,
        progress: Math.min(tasksCompleted, 1),
        maxProgress: 1,
        tier: 'bronze',
        category: 'completion',
        points: 10,
      },
      {
        id: 'task_master_10',
        title: 'Task Master',
        description: 'Complete 10 tasks',
        achieved: tasksCompleted >= 10,
        progress: Math.min(tasksCompleted, 10),
        maxProgress: 10,
        tier: 'silver',
        category: 'completion',
        points: 50,
      },
      {
        id: 'task_master_50',
        title: 'Productivity Expert',
        description: 'Complete 50 tasks',
        achieved: tasksCompleted >= 50,
        progress: Math.min(tasksCompleted, 50),
        maxProgress: 50,
        tier: 'gold',
        category: 'completion',
        points: 200,
      },
      {
        id: 'task_master_100',
        title: 'Task Legend',
        description: 'Complete 100 tasks',
        achieved: tasksCompleted >= 100,
        progress: Math.min(tasksCompleted, 100),
        maxProgress: 100,
        tier: 'platinum',
        category: 'completion',
        points: 500,
      },

      // Streak achievements
      {
        id: 'streak_3',
        title: 'Consistency',
        description: 'Maintain a 3-day streak',
        achieved: streak >= 3,
        progress: Math.min(streak, 3),
        maxProgress: 3,
        tier: 'bronze',
        category: 'streak',
        points: 15,
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        achieved: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7,
        tier: 'silver',
        category: 'streak',
        points: 35,
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        achieved: streak >= 30,
        progress: Math.min(streak, 30),
        maxProgress: 30,
        tier: 'gold',
        category: 'streak',
        points: 150,
      },

      // Time achievements
      {
        id: 'time_10h',
        title: 'Focused',
        description: 'Spend 10 hours on tasks',
        achieved: timeSpent >= 600,
        progress: Math.min(timeSpent, 600),
        maxProgress: 600,
        tier: 'bronze',
        category: 'time',
        points: 25,
      },
      {
        id: 'time_50h',
        title: 'Dedicated',
        description: 'Spend 50 hours on tasks',
        achieved: timeSpent >= 3000,
        progress: Math.min(timeSpent, 3000),
        maxProgress: 3000,
        tier: 'silver',
        category: 'time',
        points: 100,
      },
      {
        id: 'time_100h',
        title: 'Time Master',
        description: 'Spend 100 hours on tasks',
        achieved: timeSpent >= 6000,
        progress: Math.min(timeSpent, 6000),
        maxProgress: 6000,
        tier: 'gold',
        category: 'time',
        points: 250,
      },

      // Efficiency achievements
      {
        id: 'efficiency_80',
        title: 'Efficient',
        description: 'Achieve 80% completion rate',
        achieved: efficiency >= 80,
        progress: efficiency,
        maxProgress: 80,
        tier: 'silver',
        category: 'efficiency',
        points: 75,
      },
      {
        id: 'efficiency_95',
        title: 'Perfectionist',
        description: 'Achieve 95% completion rate',
        achieved: efficiency >= 95,
        progress: efficiency,
        maxProgress: 95,
        tier: 'gold',
        category: 'efficiency',
        points: 200,
      },
    ];
  }, [userStats]);

  const unlockedAchievements = achievements.filter(a => a.achieved);
  const nextAchievements = achievements.filter(a => !a.achieved).slice(0, 3);

  return {
    userStats,
    achievements,
    unlockedAchievements,
    nextAchievements,
  };
};