
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Calendar, BarChart3, Loader2 } from 'lucide-react';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskOptimizer Pro
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Task Management
            </span>
            <br />
            <span className="text-gray-900">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered scheduling, intelligent prioritization, and productivity insights 
            to help you achieve more with less stress.
          </p>
          <div className="flex items-center justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Start Now!
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-optimized time blocks that adapt to your work patterns and priorities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Priority Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Eisenhower methodology integration for effective task prioritization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Seamless visual time management with drag-and-drop scheduling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed productivity insights and performance tracking.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of professionals who have revolutionized their workflow.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 TaskOptimizer Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
