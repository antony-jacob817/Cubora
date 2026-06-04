import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Please fill in all credential fields.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.success) {
          localStorage.setItem('cubora_token', response.data.token);
          await login(response.data.token);
          navigate('/dashboard');
        }
    } catch (err: any) {
        setError(err.message || 'Invalid email or password credentials.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <AuthLayout>
        <div className="glass-panel p-5 xs:p-6 sm:p-10 w-full flex flex-col gap-6 sm:gap-8 border-white/10 dark:border-white/20">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">Enter your credentials to access the platform.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 px-3.5 py-3 rounded-xl text-red-500 dark:text-red-400 text-xs text-left leading-normal">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="flex flex-col gap-3.5 sm:gap-4" onSubmit={handleSubmit}>
            <AuthInput 
              icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <div className="space-y-2">
              <AuthInput 
                icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <div className="flex justify-end px-0.5">
                <Link to="/forgot-password" className="text-[11px] sm:text-xs font-medium text-primary hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="glow" className="w-full mt-2 min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative flex items-center text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest select-none">
            <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
            <span className="px-3 bg-transparent">Or connect with</span>
            <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
          </div>

          {/* Social buttons convert from compact grids to side-by-side targets smoothly */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
            <Button variant="secondary" className="gap-2 min-h-[42px] py-2 text-xs font-bold" type="button" disabled={isLoading}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="secondary" className="gap-2 min-h-[42px] py-2 text-xs font-bold" type="button" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
            </Button>
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline transition-colors">Sign up</Link>
          </p>
        </div>
      </AuthLayout>
    </PageTransition>
  );
}