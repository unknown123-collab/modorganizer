
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductivityAnalytics from './ProductivityAnalytics';
import RewardSystem from './RewardSystem';
import AdvancedAnalytics from './AdvancedAnalytics';
import AIInsights from './AIInsights';
import SmartTaskSuggestions from './SmartTaskSuggestions';
import { BarChart3, Trophy, TrendingUp, Brain, Sparkles } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
      </div>

      <Tabs defaultValue="advanced" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <ProductivityAnalytics />
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
          <div className="space-y-6">
            <AIInsights />
            <SmartTaskSuggestions />
          </div>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <RewardSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
