import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseTask } from '@/hooks/useSupabaseTasks';

interface TaskRecommendationProps {
  overlappingTasks: SupabaseTask[];
}

interface Recommendation {
  recommended_task_index: number;
  reasoning: string;
  key_factors: string[];
  task_ranking: Array<{
    task_index: number;
    rank: number;
    should_reschedule: boolean;
  }>;
  rescheduling_suggestions: Array<{
    task_index: number;
    suggestion: string;
  }>;
}

const TaskRecommendation = ({ overlappingTasks }: TaskRecommendationProps) => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (overlappingTasks.length > 1) {
      getRecommendation();
    }
  }, [overlappingTasks]);

  const getRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('task-recommendations', {
        body: { tasks: overlappingTasks }
      });

      if (functionError) throw functionError;
      setRecommendation(data);
    } catch (err: any) {
      console.error('Error getting recommendation:', err);
      setError(err.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  if (overlappingTasks.length < 2) return null;

  if (loading) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing overlapping tasks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!recommendation) return null;

  const recommendedTask = overlappingTasks[recommendation.recommended_task_index];

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <Lightbulb className="h-5 w-5" />
          AI Priority Recommendation ({overlappingTasks.length} Conflicting Tasks)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-medium text-yellow-900 mb-2">Priority Task:</div>
          <Badge className="bg-yellow-600 text-white text-sm px-3 py-1">
            {recommendedTask.title}
          </Badge>
        </div>

        <div>
          <div className="font-medium text-yellow-900 mb-2">Reasoning:</div>
          <p className="text-sm text-yellow-800">{recommendation.reasoning}</p>
        </div>

        <div>
          <div className="font-medium text-yellow-900 mb-2">Key Factors:</div>
          <ul className="list-disc list-inside space-y-1">
            {recommendation.key_factors.map((factor, idx) => (
              <li key={idx} className="text-sm text-yellow-800">{factor}</li>
            ))}
          </ul>
        </div>

        {recommendation.task_ranking && recommendation.task_ranking.length > 0 && (
          <div>
            <div className="font-medium text-yellow-900 mb-2">Task Ranking:</div>
            <div className="space-y-2">
              {recommendation.task_ranking
                .sort((a, b) => a.rank - b.rank)
                .map((ranking) => {
                  const task = overlappingTasks[ranking.task_index];
                  return (
                    <div key={ranking.task_index} className="flex items-center justify-between text-sm bg-white/50 p-2 rounded">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">#{ranking.rank}</Badge>
                        <span className={ranking.should_reschedule ? 'text-yellow-700' : 'text-yellow-900 font-medium'}>
                          {task?.title}
                        </span>
                      </span>
                      {ranking.should_reschedule && (
                        <Badge variant="secondary" className="text-xs">Reschedule</Badge>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {recommendation.rescheduling_suggestions && recommendation.rescheduling_suggestions.length > 0 && (
          <div>
            <div className="font-medium text-yellow-900 mb-2">Rescheduling Suggestions:</div>
            <div className="space-y-2">
              {recommendation.rescheduling_suggestions.map((suggestion) => {
                const task = overlappingTasks[suggestion.task_index];
                return (
                  <div key={suggestion.task_index} className="text-sm bg-white/50 p-3 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-900 mb-1">{task?.title}</div>
                    <p className="text-yellow-800">{suggestion.suggestion}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskRecommendation;