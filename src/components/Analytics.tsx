
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductivityAnalytics from './ProductivityAnalytics';
import RewardSystem from './RewardSystem';
import { BarChart3, Trophy, TrendingUp } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Analytics
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements & Rewards
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6">
          <ProductivityAnalytics />
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <RewardSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
