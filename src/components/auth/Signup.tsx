import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const response = await api.post('/auth/signup', { 
            name, 
            email, 
            password 
        });

        if (response.data.success) {
            localStorage.setItem('cubora_token', response.data.token);
            await signup(response.data.token);
            navigate('/dashboard');
        } else {
            setError(response.data.error || 'Registration failed.');
        }
    } catch (err: any) {
        setError('Unable to reach the server. Make sure your backend is running on port 3000.');
    }
  };

  return (
    <PageTransition>
      <AuthLayout>
        <div className="glass-panel p-5 xs:p-6 sm:p-10 w-full flex flex-col gap-6 sm:gap-8 border-white/10 dark:border-white/20">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create an account</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm">Join Cubora and start mastering the cube today.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 px-3.5 py-3 rounded-xl text-red-500 dark:text-red-400 text-xs text-left leading-normal">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="flex flex-col gap-3.5 sm:gap-4" onSubmit={handleSubmit}>
            <AuthInput 
              icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <AuthInput 
              icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            
            <AuthInput 
              icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            <AuthInput 
              icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            <Button variant="glow" className="w-full mt-2 min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Registering...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline transition-colors">Log in</Link>
          </p>
        </div>
      </AuthLayout>
    </PageTransition>
  );
}