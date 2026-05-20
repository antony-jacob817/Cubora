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
        <div className="glass-panel p-8 sm:p-10 w-full flex flex-col gap-8 border-white/20">
          
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 text-sm">Enter your email and we'll send you a link to reset your password.</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <AuthInput 
              icon={<Mail className="w-5 h-5" />}
              type="email" 
              placeholder="Email address" 
            />

            <Button variant="glow" className="w-full">
              Send Reset Link
            </Button>
          </form>

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to log in
            </Link>
          </div>
          
        </div>
      </AuthLayout>
    </PageTransition>
  );
}