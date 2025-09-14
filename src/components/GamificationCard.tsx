import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { Trophy, Target, Zap, Award } from 'lucide-react';

const GamificationCard = () => {
  const { userStats, unlockedAchievements, nextAchievements } = useGamification();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'completion': return <Target className="h-4 w-4" />;
      case 'streak': return <Zap className="h-4 w-4" />;
      case 'time': return <Trophy className="h-4 w-4" />;
      case 'efficiency': return <Award className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-4 md:gap-6">
      {/* User Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.tasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Tasks Done</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Level Progress</span>
              <span>{userStats.totalPoints % 100}/100</span>
            </div>
            <Progress value={(userStats.totalPoints % 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unlockedAchievements.slice(-3).reverse().map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full ${getTierColor(achievement.tier)} text-white`}>
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{achievement.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Goals */}
      {nextAchievements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Next Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextAchievements.map((achievement) => (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${getTierColor(achievement.tier)} text-white`}>
                        {getCategoryIcon(achievement.category)}
                      </div>
                      <span className="font-medium text-sm">{achievement.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground ml-8">{achievement.description}</p>
                  <div className="ml-8">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress)}/{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationCard;