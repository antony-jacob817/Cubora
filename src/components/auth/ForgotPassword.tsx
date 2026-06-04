import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PageTransition } from '@/components/animations/PageTransition';

export default function ForgotPassword() {
  return (
    <PageTransition>
      <AuthLayout>
        <div className="glass-panel p-5 xs:p-6 sm:p-10 w-full flex flex-col gap-6 sm:gap-8 border-white/10 dark:border-white/20">
          
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Reset Password</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          <form className="flex flex-col gap-4 sm:gap-6" onSubmit={(e) => e.preventDefault()}>
            <AuthInput 
              icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
              type="email" 
              placeholder="Email address" 
              required
            />

            <Button variant="glow" className="w-full min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider">
              Send Reset Link
            </Button>
          </form>

          <div className="text-center mt-1">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to log in
            </Link>
          </div>
          
        </div>
      </AuthLayout>
    </PageTransition>
  );
}