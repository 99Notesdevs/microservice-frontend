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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-8 relative border border-gray-100 transition-all duration-300 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          onClick={closeUserModal}
          className="absolute right-4 top-4 rounded-full h-9 w-9 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeTab === 'login' ? 'Welcome back!' : 'Create an account'}
          </h2>
          <p className="text-gray-500 text-sm">
            {activeTab === 'login' ? 'Sign in to continue' : 'Join our community today'}
          </p>
        </div>

        <div className="flex mb-8 border-b border-gray-100">
          <button
            className={cn(
              'flex-1 py-3.5 font-medium text-sm transition-all duration-200',
              activeTab === 'login' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
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
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 mt-6 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200" 
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
                <Label htmlFor="register-firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="register-firstName"
                    name="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="register-lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 opacity-0" />
                  <Input
                    id="register-lastName"
                    name="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-11 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 mt-2 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200" 
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
        
        <div className="mt-6 text-center text-sm text-gray-600">
          {activeTab === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
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
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={() => setActiveTab('login')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
        

      </div>
    </div>
  );
}

export default AuthModal;
