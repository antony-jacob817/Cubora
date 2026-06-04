import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Sparkles, Loader2 } from 'lucide-react';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export const AVATAR_PRESETS = [
  { id: 'neo', name: 'Pixel Pal', url: '/Avatars/Pixel Pal.png' },
  { id: 'speed', name: 'Swift Spark', url: '/Avatars/Swift Spark.png' },
  { id: 'coach', name: 'Guide Bot', url: '/Avatars/Guide Bot.png' },
  { id: 'grandmaster', name: 'Cube Guru', url: '/Avatars/Cube Guru.png' },
  { id: 'solve', name: 'Logic Buddy', url: '/Avatars/Logic Buddy.png' },
  { id: 'quantum', name: 'Cosmic Churn', url: '/Avatars/Cosmic Churn.png' },
  { id: 'cyber', name: 'Cyber Scout', url: '/Avatars/Cyber Scout.png' },
  { id: 'astra', name: 'Star Cuber', url: '/Avatars/Star Cuber.png' }
];

export function AvatarSelectionModal() {
  const { user, getAuthHeaders, refetchUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    if (!selectedAvatar) {
      setError('Please select an avatar to represent your cubing profile.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ avatar: selectedAvatar })
      });

      const data = await response.json();
      if (data.success) {
        await refetchUser();
      } else {
        setError(data.error || 'Failed to save avatar settings.');
      }
    } catch (err) {
      console.error('Error saving avatar:', err);
      setError('A connection issue occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={!!user && !user.avatar}
      onClose={() => {}} // Mandatory selection on onboarding, no-op for close
      className="max-w-xl p-5 xs:p-6 sm:p-8 flex flex-col items-center gap-5 sm:gap-6 rounded-[24px] sm:rounded-[32px] max-h-[88vh] overflow-y-auto hide-scrollbar border-slate-200 dark:border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
    >
      {/* Top glowing ambient decor */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[60px] rounded-full pointer-events-none z-0" />

      <div className="flex flex-col items-center gap-2 relative z-10 w-full text-center">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-animated flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] mb-1">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight px-1 break-words max-w-full">
          Welcome to Cubora, {user.name}!
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed">
          Please choose a speedcubing or AI avatar identity to personalize your solving profile.
        </p>
      </div>

      {/* Grid of Avatars */}
      <motion.div 
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 w-full my-1 sm:my-2 relative z-10"
        variants={{
          visible: { transition: { staggerChildren: 0.04 } }
        }}
        initial="hidden"
        animate="visible"
      >
        {AVATAR_PRESETS.map((preset) => {
          const isSelected = selectedAvatar === preset.url;
          return (
            <motion.button
              key={preset.id}
              variants={itemVariants}
              onClick={() => {
                setSelectedAvatar(preset.url);
                setError(null);
              }}
              className={`relative flex flex-col items-center justify-between gap-2 p-2.5 rounded-2xl border transition-all duration-300 group min-h-[110px] ${
                isSelected
                  ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200/50 dark:border-white/5 bg-surface overflow-hidden flex-shrink-0">
                <img 
                  src={preset.url} 
                  alt={preset.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </div>
              <span className={`text-[10px] font-bold tracking-tight text-center leading-snug w-full truncate ${
                isSelected ? 'text-primary' : 'text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}>
                {preset.name}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {error && (
        <div className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/10 relative z-10 text-left w-full">
          {error}
        </div>
      )}

      <div className="w-full flex flex-col gap-3 relative z-10 mt-auto">
        <Button
          variant="glow"
          onClick={handleSave}
          disabled={isSaving || !selectedAvatar}
          className="w-full h-11 sm:h-12 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 min-h-[44px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Profile...
            </>
          ) : (
            'Save Cuber Identity'
          )}
        </Button>
      </div>
    </Modal>
  );
}