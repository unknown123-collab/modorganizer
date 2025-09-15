import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Calendar, Target, Plus, X } from 'lucide-react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { useUserSettings } from '@/hooks/useUserSettings';

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'optimization' | 'scheduling' | 'productivity' | 'health';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  deadline?: Date;
  taskData?: {
    title: string;
    description?: string;
    priority: 'urgent-important' | 'urgent-notImportant' | 'notUrgent-important' | 'notUrgent-notImportant';
    time_estimate: number;
    deadline?: string;
  };
}

const SmartTaskSuggestions = () => {
  const { tasks, addTask } = useSupabaseTasks();
  const { settings } = useUserSettings();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    generateSmartSuggestions();
  }, [tasks, settings]);

  const generateSmartSuggestions = () => {
    const newSuggestions: SmartSuggestion[] = [];
    const completedTasks = tasks.filter(t => t.completed && !t.archived);
    const pendingTasks = tasks.filter(t => !t.completed && !t.archived);
    const now = new Date();

    // Health & Break suggestions
    const focusTime = settings?.focus_time || 25;
    if (focusTime > 45) {
      newSuggestions.push({
        id: 'break-reminder',
        title: 'Schedule Regular Breaks',
        description: 'Your focus sessions are quite long. Consider adding short breaks to maintain productivity.',
        category: 'health',
        priority: 'medium',
        estimatedTime: 5,
        taskData: {
          title: 'Take a 5-minute break',
          description: 'Step away from work, stretch, or do breathing exercises',
          priority: 'notUrgent-important',
          time_estimate: 5
        }
      });
    }

    // Productivity optimization
    const tasksWithoutEstimates = pendingTasks.filter(t => !t.time_estimate);
    if (tasksWithoutEstimates.length > 2) {
      newSuggestions.push({
        id: 'estimate-tasks',
        title: 'Add Time Estimates',
        description: `${tasksWithoutEstimates.length} tasks are missing time estimates. This helps with better planning.`,
        category: 'optimization',
        priority: 'medium',
        estimatedTime: 10,
        taskData: {
          title: 'Review and estimate task durations',
          description: 'Go through pending tasks and add realistic time estimates',
          priority: 'notUrgent-important',
          time_estimate: 15
        }
      });
    }

    // Deadline management
    const upcomingDeadlines = pendingTasks.filter(t => {
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline);
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 3 && daysUntil > 0;
    });

    if (upcomingDeadlines.length > 0) {
      newSuggestions.push({
        id: 'review-deadlines',
        title: 'Review Upcoming Deadlines',
        description: `You have ${upcomingDeadlines.length} task${upcomingDeadlines.length > 1 ? 's' : ''} due within 3 days.`,
        category: 'scheduling',
        priority: 'high',
        estimatedTime: 15,
        taskData: {
          title: 'Review and prioritize upcoming deadlines',
          description: 'Check tasks due soon and adjust priorities if needed',
          priority: 'urgent-important',
          time_estimate: 15
        }
      });
    }

    // Weekly planning suggestion
    const today = new Date();
    const isMonday = today.getDay() === 1;
    const hasWeeklyPlanningTask = tasks.some(t => 
      t.title.toLowerCase().includes('weekly') && 
      t.title.toLowerCase().includes('plan')
    );

    if (isMonday && !hasWeeklyPlanningTask) {
      newSuggestions.push({
        id: 'weekly-planning',
        title: 'Weekly Planning Session',
        description: 'Start your week with a planning session to organize priorities and goals.',
        category: 'productivity',
        priority: 'high',
        estimatedTime: 30,
        taskData: {
          title: 'Weekly planning and goal setting',
          description: 'Review last week, set priorities for this week, and plan major tasks',
          priority: 'urgent-important',
          time_estimate: 30
        }
      });
    }

    // Task completion celebration
    if (completedTasks.length > 0 && completedTasks.length % 10 === 0) {
      newSuggestions.push({
        id: 'celebrate-milestone',
        title: 'Celebrate Your Progress!',
        description: `You've completed ${completedTasks.length} tasks! Take a moment to acknowledge your achievement.`,
        category: 'health',
        priority: 'low',
        estimatedTime: 10,
        taskData: {
          title: 'Celebrate completed tasks milestone',
          description: 'Take a moment to appreciate your progress and reward yourself',
          priority: 'notUrgent-notImportant',
          time_estimate: 10
        }
      });
    }

    // Learning and improvement
    const lowPriorityTasks = pendingTasks.filter(t => t.priority === 'notUrgent-notImportant');
    if (lowPriorityTasks.length > 10) {
      newSuggestions.push({
        id: 'review-priorities',
        title: 'Review Task Priorities',
        description: 'You have many low-priority tasks. Consider if some should be elevated or archived.',
        category: 'optimization',
        priority: 'medium',
        estimatedTime: 20,
        taskData: {
          title: 'Review and adjust task priorities',
          description: 'Go through low-priority tasks and reassess their importance',
          priority: 'notUrgent-important',
          time_estimate: 20
        }
      });
    }

    // Filter out dismissed suggestions
    const filteredSuggestions = newSuggestions.filter(s => 
      !dismissedSuggestions.includes(s.id)
    );

    setSuggestions(filteredSuggestions.slice(0, 4)); // Show max 4 suggestions
  };

  const handleAcceptSuggestion = async (suggestion: SmartSuggestion) => {
    if (suggestion.taskData) {
      try {
        await addTask(suggestion.taskData);
        setDismissedSuggestions(prev => [...prev, suggestion.id]);
      } catch (error) {
        console.error('Failed to add suggested task:', error);
      }
    }
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'scheduling': return <Calendar className="h-4 w-4" />;
      case 'productivity': return <Sparkles className="h-4 w-4" />;
      case 'health': return <Clock className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">
              No New Suggestions
            </h3>
            <p className="mt-1 text-sm text-muted-foreground/60">
              You're all caught up! New suggestions will appear based on your task patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 rounded-lg border bg-card/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(suggestion.category)}
                  <h4 className="font-medium">{suggestion.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissSuggestion(suggestion.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {suggestion.estimatedTime} min
                  </span>
                  <span className="capitalize">{suggestion.category}</span>
                </div>
                
                {suggestion.taskData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartTaskSuggestions;