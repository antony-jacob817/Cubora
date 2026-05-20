import { Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PageTransition } from '@/components/animations/PageTransition';

export default function Signup() {
  return (
    <PageTransition>
      <AuthLayout>
        <div className="glass-panel p-8 sm:p-10 w-full flex flex-col gap-8 border-white/20">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-white">Create an account</h1>
            <p className="text-gray-400 text-sm">Join Cubora and start mastering the cube today.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <AuthInput 
              icon={<User className="w-5 h-5" />}
              type="text" 
              placeholder="Full Name" 
            />
            
            <AuthInput 
              icon={<Mail className="w-5 h-5" />}
              type="email" 
              placeholder="Email address" 
            />
            
            <AuthInput 
              icon={<Lock className="w-5 h-5" />}
              type="password" 
              placeholder="Password" 
            />

            <AuthInput 
              icon={<Lock className="w-5 h-5" />}
              type="password" 
              placeholder="Confirm Password" 
            />

            <Button variant="glow" className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-primary hover:text-white transition-colors">Log in</Link>
          </p>
        </div>
      </AuthLayout>
    </PageTransition>
  );
}