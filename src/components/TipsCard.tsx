
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';

const TipsCard = () => {
  const { getProductivityTips } = useTaskContext();
  const tips = getProductivityTips();
  
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Productivity Tips</h2>
      
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="text-primary mt-1">✦</div>
            <div className="text-sm">{tip}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TipsCard;
