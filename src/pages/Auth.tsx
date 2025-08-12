
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain, Target, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { signIn, signUp, user, signInWithGoogle, resetPasswordForEmail, updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryOpen(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully."
      });
      // Navigation will happen automatically via useEffect when user state updates
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account, or you can sign in directly if email confirmation is disabled."
      });
    }
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ title: 'Google sign-in failed', description: error.message, variant: 'destructive' });
      setLoading(false);
    } else {
      toast({ title: 'Redirecting...', description: 'Continue with Google.' });
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const targetEmail = resetEmail || formData.email;
    const { error } = await resetPasswordForEmail(targetEmail);
    if (error) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email sent', description: 'Check your inbox for the reset link.' });
      setResetOpen(false);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: 'Please re-type them.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      setRecoveryOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Features showcase */}
        <div className="space-y-8">
          {/* Back to home button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              TaskOptimizer Pro
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Intelligent task management with AI-powered scheduling and productivity insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Smart Scheduling</h3>
                <p className="text-sm text-muted-foreground">AI-optimized time blocks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Priority Matrix</h3>
                <p className="text-sm text-muted-foreground">Eisenhower methodology</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Calendar Integration</h3>
                <p className="text-sm text-muted-foreground">Visual time management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">Productivity insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                        onClick={() => setResetOpen(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">or</div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.3-1.5 3.9-5.1 3.9-3.1 0-5.6-2.6-5.6-5.7s2.5-5.7 5.6-5.7c1.8 0 3 .7 3.7 1.3l2.5-2.4C16.6 3.9 14.5 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c6.8 0 9.4-4.8 9.4-7.2 0-.5 0-.8-.1-1.2H12z"/>
                        <path fill="#34A853" d="M3.6 7.4l3 2.2c.8-2.1 2.7-3.6 5.4-3.6 1.8 0 3 .7 3.7 1.3l2.5-2.4C16.6 3.9 14.5 3 12 3 8 3 4.7 5.2 3.6 7.4z"/>
                        <path fill="#FBBC05" d="M12 21.4c2.5 0 4.6-.8 6.1-2.1l-3-2.5c-.8.5-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.7l-3 2.3c1.1 2.2 3.4 5.1 8.1 5.1z"/>
                        <path fill="#4285F4" d="M21.4 12.2c0-.5 0-.8-.1-1.2H12v3.6h5.1c-.3 1.7-1.7 3.9-5.1 3.9-3.1 0-5.6-2.6-5.6-5.7 0-.9.2-1.8.6-2.6l-3-2.2c-.7 1.4-1.1 3-1.1 4.8 0 5.1 4.1 9.2 9.2 9.2 5.3 0 9.2-3.7 9.2-9.8z"/>
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
                </Tabs>

                {/* Password Reset Dialog */}
                <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset your password</DialogTitle>
                      <DialogDescription>We'll email you a reset link.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSendResetEmail} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resetEmail">Email</Label>
                        <Input
                          id="resetEmail"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          disabled={loading}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Send reset link
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* New Password Dialog (after recovery link) */}
                <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set a new password</DialogTitle>
                      <DialogDescription>Enter and confirm your new password.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          disabled={loading}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update password
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
};

export default Auth;
