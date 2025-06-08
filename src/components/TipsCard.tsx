
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lightbulb } from 'lucide-react';

const TipsCard = () => {
  // Static productivity tips since we don't need dynamic tips from TaskContext
  const tips = [
    "Break large tasks into smaller, manageable chunks",
    "Use the Pomodoro Technique: 25 minutes focused work, 5 minute break",
    "Prioritize tasks using the Eisenhower Matrix (urgent vs important)",
    "Set specific deadlines for your tasks to maintain momentum",
    "Review and adjust your task list daily to stay on track"
  ];
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-medium">Productivity Tips</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3 group">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-primary group-hover:border-primary transition-colors">
                <span className="text-xs font-medium">{index + 1}</span>
              </div>
              <div className="text-sm">{tip}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TipsCard;
