
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import TaskInput from './TaskInput';
import PriorityTasksCard from './PriorityTasksCard';
import ProductivityStatsCard from './ProductivityStatsCard';
import TasksProgressCard from './TasksProgressCard';
import TipsCard from './TipsCard';
import { LayoutGrid, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { tasks, productivityStats } = useTaskContext();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <LayoutGrid className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      {/* Task Input */}
      <TaskInput />
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PriorityTasksCard />
        <ProductivityStatsCard />
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <TipsCard />
        </div>
      </div>
      
      {/* Progress Overview */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Tasks Progress</h2>
        </div>
        <TasksProgressCard />
      </div>
    </div>
  );
};

export default Dashboard;
