'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * Admin Login Page
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading, error, clearError } = useAdmin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear errors when email/password changes
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [email, password, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      router.push('/admin/dashboard');
    } else {
      setLocalError(result.message || 'Login failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-text">Barracuda</h1>
              <p className="text-sm text-text-muted">Admin Panel</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text mb-2">Welcome back</h2>
            <p className="text-text-muted">Enter your credentials to access the admin panel</p>
          </div>

          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-center gap-3 text-accent-red">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error || localError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@barracuda.com"
                  className="w-full bg-surface-200 border border-surface-300 rounded-xl py-3 pl-12 pr-4 text-text placeholder-text-muted focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-surface-200 border border-surface-300 rounded-xl py-3 pl-12 pr-12 text-text placeholder-text-muted focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-surface-200 border-surface-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-text-muted">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-400 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-text-muted">
             
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-surface-200 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-32 h-32 bg-primary-500/20 rounded-full mx-auto mb-8 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-primary-500" />
          </div>
          <h3 className="text-2xl font-bold text-text mb-4">
            Barracuda Admin Panel
          </h3>
          <p className="text-text-muted">
            Manage your Barracuda network, track contacts, and monitor performance all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

