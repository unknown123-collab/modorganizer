
import React from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import TaskInput from './TaskInput';
import PriorityTasksCard from './PriorityTasksCard';
import ProductivityStatsCard from './ProductivityStatsCard';
import TasksProgressCard from './TasksProgressCard';
import TipsCard from './TipsCard';

const Dashboard = () => {
  const { tasks, productivityStats } = useTaskContext();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Task Input */}
      <TaskInput />
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PriorityTasksCard />
        <ProductivityStatsCard />
        <TipsCard />
      </div>
      
      {/* Progress Overview */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Tasks Progress</h2>
        <TasksProgressCard />
      </div>
    </div>
  );
};

export default Dashboard;
