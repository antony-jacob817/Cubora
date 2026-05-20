import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PageTransition } from '@/components/animations/PageTransition';

export default function Login() {
  return (
    <PageTransition>
      <AuthLayout>
        <div className="glass-panel p-8 sm:p-10 w-full flex flex-col gap-8 border-white/20">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm">Enter your credentials to access the scanner.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <AuthInput 
              icon={<Mail className="w-5 h-5" />}
              type="email" 
              placeholder="Email address" 
            />
            
            <div className="space-y-2">
              <AuthInput 
                icon={<Lock className="w-5 h-5" />}
                type="password" 
                placeholder="Password" 
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="glow" className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="relative flex items-center text-xs text-gray-500 uppercase tracking-widest">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 bg-transparent">Or continue with</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" className="gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button variant="secondary" className="gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12.07C22 6.48 17.52 2 11.93 2 6.34 2 1.86 6.48 1.86 12.07c0 5.04 3.69 9.21 8.51 9.93v-7.02H7.83v-2.91h2.54V9.85c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.83-.72 8.5-4.89 8.5-9.93Z"/></svg>
                GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400">
            Don't have an account? <Link to="/signup" className="text-primary hover:text-white transition-colors">Sign up</Link>
          </p>
        </div>
      </AuthLayout>
    </PageTransition>
  );
}