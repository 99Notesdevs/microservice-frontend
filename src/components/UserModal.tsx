"use client";

import { X, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { env } from '../config/env';
import { cn } from '../lib/utils';

export function AuthModal() {
  const { isUserModalOpen, userModalType, closeUserModal } = useUser();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(userModalType || 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (userModalType) {
      setActiveTab(userModalType);
    }
  }, [userModalType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (type === 'login') {
        const response = await fetch(`${env.API_AUTH}/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });
        
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to login. Please check your credentials.');
        }
      } else {
        // Register
        const response = await fetch(`${env.API_AUTH}/user/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || 'Registration failed. Please try again.');
        }
      }
      
      closeUserModal();
      // Reset form on successful submission
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      console.error(`${type} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUserModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[90%] max-w-md p-8 relative border border-gray-200 dark:border-gray-800 transition-all duration-300 transform"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
            variant="outline"
          onClick={closeUserModal}
          className="absolute right-4 top-4 rounded-full h-8 w-8 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {activeTab === 'login' ? 'Welcome back!' : 'Create an account'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {activeTab === 'login' ? 'Sign in to continue' : 'Join our community today'}
          </p>
        </div>

        <div className="flex mb-8 border-b border-gray-200 dark:border-gray-800">
          <button
            className={cn(
              'flex-1 py-3 font-medium text-sm transition-colors duration-200',
              activeTab === 'login' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={cn(
              'flex-1 py-3 font-medium text-sm transition-colors duration-200',
              activeTab === 'register' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('register')}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-sm font-medium text-muted-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 mt-6 font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="register-firstName" className="text-sm font-medium text-muted-foreground">
                  First Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="register-firstName"
                    name="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-lastName" className="text-sm font-medium text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="register-lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="register-email" className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="register-password" className="text-sm font-medium text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-11"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 mt-2 font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : 'Create account'}
            </Button>
          </form>
        )}
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {activeTab === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                className="font-medium text-primary hover:underline"
                onClick={() => setActiveTab('register')}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                className="font-medium text-primary hover:underline"
                onClick={() => setActiveTab('login')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" disabled={isLoading}>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
