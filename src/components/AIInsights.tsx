import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, TrendingUp, Clock, Target, AlertTriangle } from 'lucide-react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { useUserSettings } from '@/hooks/useUserSettings';

interface Insight {
  id: string;
  type: 'productivity' | 'time' | 'priority' | 'workload';
  title: string;
  description: string;
  action?: string;
  severity: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

const AIInsights = () => {
  const { tasks, timeBlocks } = useSupabaseTasks();
  const { settings } = useUserSettings();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    generateInsights();
  }, [tasks, timeBlocks, settings]);

  const generateInsights = () => {
    const newInsights: Insight[] = [];
    const completedTasks = tasks.filter(t => t.completed && !t.archived);
    const pendingTasks = tasks.filter(t => !t.completed && !t.archived);
    const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent-important');
    const overdueTasks = pendingTasks.filter(t => 
      t.deadline && new Date(t.deadline) < new Date()
    );

    // Productivity Insight
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    if (completionRate < 60) {
      newInsights.push({
        id: 'low-completion',
        type: 'productivity',
        title: 'Low Completion Rate',
        description: `Your task completion rate is ${completionRate.toFixed(1)}%. Consider breaking large tasks into smaller, manageable pieces.`,
        action: 'Break down complex tasks',
        severity: 'medium',
        icon: <TrendingUp className="h-4 w-4" />
      });
    }

    // Overdue Tasks Insight
    if (overdueTasks.length > 0) {
      newInsights.push({
        id: 'overdue-tasks',
        type: 'priority',
        title: 'Overdue Tasks Alert',
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Review and reschedule them to stay on track.`,
        action: 'Review overdue tasks',
        severity: 'high',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    // Time Management Insight
    const tasksWithoutEstimates = pendingTasks.filter(t => !t.time_estimate);
    if (tasksWithoutEstimates.length > 3) {
      newInsights.push({
        id: 'missing-estimates',
        type: 'time',
        title: 'Missing Time Estimates',
        description: `${tasksWithoutEstimates.length} tasks don't have time estimates. Adding estimates helps with better scheduling.`,
        action: 'Add time estimates',
        severity: 'low',
        icon: <Clock className="h-4 w-4" />
      });
    }

    // Workload Insight
    if (urgentTasks.length > 5) {
      newInsights.push({
        id: 'too-many-urgent',
        type: 'workload',
        title: 'Urgent Task Overload',
        description: `You have ${urgentTasks.length} urgent tasks. Consider delegating or rescheduling some to maintain quality.`,
        action: 'Reassess priorities',
        severity: 'medium',
        icon: <Target className="h-4 w-4" />
      });
    }

    // Focus Time Insight
    if (settings?.focus_time && settings.focus_time < 25) {
      newInsights.push({
        id: 'short-focus',
        type: 'productivity',
        title: 'Short Focus Sessions',
        description: `Your focus time is set to ${settings.focus_time} minutes. Consider increasing to 25-45 minutes for better deep work.`,
        action: 'Increase focus time',
        severity: 'low',
        icon: <Brain className="h-4 w-4" />
      });
    }

    setInsights(newInsights);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <TrendingUp className="h-3 w-3" />;
      case 'low': return <Lightbulb className="h-3 w-3" />;
      default: return <Lightbulb className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-lg border bg-card/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {insight.icon}
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  <Badge 
                    variant={getSeverityColor(insight.severity)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {getSeverityIcon(insight.severity)}
                    {insight.severity}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                
                {insight.action && (
                  <Button variant="outline" size="sm" className="text-xs">
                    {insight.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">
              All Looking Good!
            </h3>
            <p className="mt-1 text-sm text-muted-foreground/60">
              No insights or recommendations at the moment. Keep up the great work!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;