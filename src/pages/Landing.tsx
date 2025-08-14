
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
      <nav className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MODO
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/auth')} size="sm" className="text-sm sm:text-base">
            Sign In
          </Button>
          <Button onClick={() => navigate('/auth')} size="sm" className="text-sm sm:text-base">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Task Management
            </span>
            <br />
            <span className="text-gray-900">Made Simple</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            AI-powered scheduling, intelligent prioritization, and productivity insights 
            to help you achieve more with less stress.
          </p>
          <div className="flex items-center justify-center px-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="w-full sm:w-auto text-base sm:text-lg px-8 py-3">
              Start Now!
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20 px-4">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                AI-optimized time blocks that adapt to your work patterns and priorities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Target className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Priority Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Eisenhower methodology integration for effective task prioritization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Seamless visual time management with drag-and-drop scheduling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-base sm:text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Detailed productivity insights and performance tracking.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white mx-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Transform Your Productivity?</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90">
            Join thousands of professionals who have revolutionized their workflow.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="w-full sm:w-auto text-base sm:text-lg px-8 py-3">
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">&copy; 2024 MODO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
