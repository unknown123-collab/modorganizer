
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lightbulb } from 'lucide-react';

const TipsCard = () => {
  const { getProductivityTips } = useTaskContext();
  const tips = getProductivityTips();
  
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
