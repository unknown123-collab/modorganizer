import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { Trophy, Star, Zap, Target, Clock, Brain, Award, Medal, Crown } from 'lucide-react';
import { format, subDays, isAfter, startOfDay, endOfDay, isBefore } from 'date-fns';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  achieved: boolean;
  progress: number;
  maxProgress: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'completion' | 'streak' | 'time' | 'efficiency';
}

const RewardSystem = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();

  const achievements = useMemo((): Achievement[] => {
    const now = new Date();
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(now, i);
      const dayStart = startOfDay(checkDate);
      const dayEnd = endOfDay(checkDate);
      
      const dayCompleted = tasks.some(t => 
        t.completed && t.updated_at && 
        isAfter(new Date(t.updated_at), dayStart) && 
        isBefore(new Date(t.updated_at), dayEnd)
      );
      
      if (dayCompleted) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate time focused (hours, clamped)
    const timeSpent = timeBlocks
      .filter(block => block.completed)
      .reduce((total, block) => {
        const start = new Date(block.start_time);
        const end = new Date(block.end_time);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const safe = Number.isFinite(durationHours) ? Math.max(0, durationHours) : 0;
        return total + safe;
      }, 0);

    // Calculate completion rate
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return [
      // Completion Achievements
      {
        id: 'first-task',
        title: 'First Steps',
        description: 'Complete your first task',
        icon: Target,
        achieved: completedTasks >= 1,
        progress: Math.min(completedTasks, 1),
        maxProgress: 1,
        tier: 'bronze',
        category: 'completion'
      },
      {
        id: 'task-master-10',
        title: 'Task Master',
        description: 'Complete 10 tasks',
        icon: Award,
        achieved: completedTasks >= 10,
        progress: Math.min(completedTasks, 10),
        maxProgress: 10,
        tier: 'silver',
        category: 'completion'
      },
      {
        id: 'task-champion-50',
        title: 'Task Champion',
        description: 'Complete 50 tasks',
        icon: Medal,
        achieved: completedTasks >= 50,
        progress: Math.min(completedTasks, 50),
        maxProgress: 50,
        tier: 'gold',
        category: 'completion'
      },
      {
        id: 'task-legend-100',
        title: 'Task Legend',
        description: 'Complete 100 tasks',
        icon: Crown,
        achieved: completedTasks >= 100,
        progress: Math.min(completedTasks, 100),
        maxProgress: 100,
        tier: 'platinum',
        category: 'completion'
      },

      // Streak Achievements
      {
        id: 'streak-3',
        title: 'Getting Started',
        description: 'Maintain a 3-day streak',
        icon: Zap,
        achieved: streak >= 3,
        progress: Math.min(streak, 3),
        maxProgress: 3,
        tier: 'bronze',
        category: 'streak'
      },
      {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: Star,
        achieved: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7,
        tier: 'silver',
        category: 'streak'
      },
      {
        id: 'streak-30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: Trophy,
        achieved: streak >= 30,
        progress: Math.min(streak, 30),
        maxProgress: 30,
        tier: 'gold',
        category: 'streak'
      },

      // Time Achievements
      {
        id: 'focused-10h',
        title: 'Focused Mind',
        description: 'Spend 10 hours in focused work',
        icon: Clock,
        achieved: timeSpent >= 10,
        progress: Math.min(timeSpent, 10),
        maxProgress: 10,
        tier: 'bronze',
        category: 'time'
      },
      {
        id: 'focused-50h',
        title: 'Time Master',
        description: 'Spend 50 hours in focused work',
        icon: Brain,
        achieved: timeSpent >= 50,
        progress: Math.min(timeSpent, 50),
        maxProgress: 50,
        tier: 'silver',
        category: 'time'
      },

      // Efficiency Achievements
      {
        id: 'efficiency-80',
        title: 'Efficiency Expert',
        description: 'Achieve 80% completion rate',
        icon: Target,
        achieved: completionRate >= 80,
        progress: Math.min(completionRate, 80),
        maxProgress: 80,
        tier: 'gold',
        category: 'efficiency'
      }
    ];
  }, [tasks, timeBlocks]);

  const achievedCount = achievements.filter(a => a.achieved).length;
  const totalPoints = achievements.filter(a => a.achieved).reduce((sum, a) => {
    const tierPoints = { bronze: 10, silver: 25, gold: 50, platinum: 100 };
    return sum + tierPoints[a.tier];
  }, 0);

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierIcon = (tier: string) => {
    switch(tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🏅';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Achievements & Rewards</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Points</p>
          <p className="text-2xl font-bold text-primary">{totalPoints}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Achievement Progress</h3>
            <Badge variant="secondary">{achievedCount}/{achievements.length} Unlocked</Badge>
          </div>
          <Progress value={(achievedCount / achievements.length) * 100} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round((achievedCount / achievements.length) * 100)}% of achievements unlocked
          </p>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      {['completion', 'streak', 'time', 'efficiency'].map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements
                .filter(a => a.category === category)
                .map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.achieved 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-muted bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <achievement.icon 
                        className={`h-8 w-8 ${
                          achievement.achieved ? 'text-primary' : 'text-muted-foreground'
                        }`} 
                      />
                      <Badge className={getTierColor(achievement.tier)}>
                        {getTierIcon(achievement.tier)} {achievement.tier}
                      </Badge>
                    </div>
                    
                    <h4 className={`font-semibold mb-1 ${
                      achievement.achieved ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    {achievement.achieved && (
                      <div className="mt-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Unlocked!</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RewardSystem;
