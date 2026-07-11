import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Bolt, User, Timer, Palette, Shield,
  Check, Loader2, LogOut, ChevronRight, ChevronDown,
  Trash2, AlertTriangle, X, Key
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type Theme, type Accent } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { AVATAR_PRESETS } from '@/components/layout/AvatarSelectionModal';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

interface UserSettings {
  preferredMethod: string;
  theme: string;
  timerInspection: boolean;
  smartCubeConnected: boolean;
  accent?: string;
}

const METHODS = ['Beginner', 'Simplified CFOP', 'CFOP', 'Roux', 'ZZ'];
const THEMES = ['dark', 'light', 'system'];

export default function SettingsPage() {
  const { user, logout, getAuthHeaders, refetchUser } = useAuth();
  const { theme: activeTheme, setTheme: setActiveTheme, accent: activeAccent, setAccent: setActiveAccent } = useTheme();
  const navigate = useNavigate();

  const [isCubeDropdownOpen, setIsCubeDropdownOpen] = useState(false);
  const [cubeMessage, setCubeMessage] = useState<string | null>(null);
  const [smartCubeMessage, setSmartCubeMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || '');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Staged states for appearances
  const [stagedTheme, setStagedTheme] = useState<Theme>(activeTheme);
  const [stagedAccent, setStagedAccent] = useState<Accent>(activeAccent);

  useEffect(() => {
    setStagedTheme(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    setStagedAccent(activeAccent);
  }, [activeAccent]);

  // Derive staged dark mode
  const isStagedDark = stagedTheme === 'system'
    ? (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true)
    : stagedTheme === 'dark';

  // Account deletion states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Change password states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings', { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
          if (data.data.theme) {
            setStagedTheme(data.data.theme as Theme);
          }
          if (data.data.accent) {
            setStagedAccent(data.data.accent as Accent);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Sync avatar state
  useEffect(() => {
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
    }
  }, [user]);

  // Sync display name state
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user]);

  const handleSave = async () => {
    if (!settings || isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setNameError(null);

    try {
      // 1. If name changed, update it first with strict 24h frequency check
      if (displayName && displayName !== user?.name) {
        const nameRes = await fetch('http://localhost:5000/api/auth/name', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ name: displayName }),
        });
        const nameData = await nameRes.json();
        if (!nameData.success) {
          setNameError(nameData.error || 'Failed to update display name.');
          setIsSaving(false);
          return; // Stop the pipeline
        }
      }

      // 2. Save settings
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...settings,
          theme: stagedTheme,
          accent: stagedAccent
        }),
      });
      const data = await res.json();

      // 3. Save avatar if changed
      if (selectedAvatar && selectedAvatar !== user?.avatar) {
        const avatarRes = await fetch('http://localhost:5000/api/auth/avatar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ avatar: selectedAvatar }),
        });
        const avatarData = await avatarRes.json();
        if (avatarData.success) {
          // Sync handled in refetchUser
        }
      }

      await refetchUser();

      if (data.success) {
        setSettings(data.data);
        setActiveTheme(stagedTheme);
        setActiveAccent(stagedAccent);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" to authorize deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/delete', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setIsDeleteModalOpen(false);
        logout();
        navigate('/');
      } else {
        setDeleteError(data.error || 'Failed to delete account.');
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleteError('A connection error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setIsPasswordModalOpen(false), 2000);
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Failed to update password:', err);
      setPasswordError('A network error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const updateField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-5 sm:gap-6 px-1 sm:px-0">
        <div className="animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl h-10 w-48 mb-2" />
        <div className="animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl h-64 w-full" />
        <div className="animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl h-48 w-full" />
      </div>
    );
  }

  return (
    <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-1 sm:px-0 text-left">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-5 sm:gap-6 max-w-3xl w-full mx-auto">

        {/* --- ACTIONS HEADER PANEL --- */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
              <Bolt className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" /> Settings
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">Manage your account, preferences, and timer configuration.</p>
          </div>
          <Button
            variant="glow"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto gap-2 justify-center h-11 min-h-[44px] text-xs font-bold uppercase tracking-wider"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* --- SECTION 1: PROFILE MANAGEMENT --- */}
        <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 w-full">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Profile Identity</h2>
          </div>

          <div className="space-y-4 sm:space-y-5 w-full">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setNameError(null);
                }}
                // CHANGED: text-xs to text-[16px] to prevent iOS zoom
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[16px] sm:text-sm"
                placeholder="Display Name"
              />
              {nameError ? (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">{nameError}</p>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-gray-600 mt-1">Can be changed once every 24 hours.</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-500 dark:text-gray-400 text-xs sm:text-sm min-h-[44px] flex items-center select-all">
                {user?.email || 'Not available'}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 block">Avatar Presets Mesh</label>
              {/* Responsive mesh sizing adjustments */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 w-full">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={clsx(
                        "relative p-1 rounded-xl border transition-all duration-300 group focus:outline-none min-w-[44px] min-h-[44px]",
                        isSelected
                          ? "bg-primary/20 border-primary shadow-[0_0_15px_var(--accent-glow-intense)] scale-105"
                          : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200/50 dark:hover:bg-white/10"
                      )}
                    >
                      <div className="aspect-square w-full rounded-lg bg-surface overflow-hidden flex items-center justify-center">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- SECTION 2: CUBING PREFERENCES --- */}
        <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 w-full">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
              <Bolt className="w-4 h-4 text-secondary" />
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Solving Target Preference</h2>
          </div>

          {/* NEW CUBE TYPE DROPDOWN */}
          <div className="w-full mb-6 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 block">Target Puzzle Size</label>
            <button
              type="button"
              onClick={() => setIsCubeDropdownOpen(!isCubeDropdownOpen)}
              className={clsx(
                "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white transition-all min-h-[44px]",
                isCubeDropdownOpen ? "border-primary/50 shadow-[0_0_15px_var(--accent-glow)]" : "hover:bg-slate-100 dark:hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                3x3 Standard
              </div>
              <ChevronDown className={clsx("w-4 h-4 text-slate-500 transition-transform duration-300", isCubeDropdownOpen && "rotate-180")} />
            </button>

            {/* Absolute Positioned Dropdown Menu */}
            <AnimatePresence>
              {isCubeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#181A1D] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1"
                >
                  {/* Active 3x3 Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCubeDropdownOpen(false);
                      setCubeMessage(null);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white bg-primary/10"
                  >
                     <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                     3x3 Standard
                  </button>
                  
                  {/* Inactive Options */}
                  {['2x2', '4x4', '5x5'].map(cube => (
                    <button
                      key={cube}
                      type="button"
                      onClick={() => {
                        setCubeMessage(`${cube} support is coming soon!`);
                        setIsCubeDropdownOpen(false);
                        setTimeout(() => setCubeMessage(null), 3000); // Clears message after 3 seconds
                      }}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-sm font-medium text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-gray-600"></span>
                         {cube}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Coming Soon</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Temporary Coming Soon Message Toast */}
            <AnimatePresence>
              {cubeMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-bold text-primary mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {cubeMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* EXISTING TRACK METHOD GRID */}
          <div className="w-full">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 block">Preferred Track Method</label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
              {METHODS.map((method, index) => (
                <button
                  key={method}
                  onClick={() => updateField('preferredMethod', method)}
                  className={clsx(
                    "px-2 sm:px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border min-h-[44px]",
                    index === METHODS.length - 1 && "col-span-2 md:col-span-1",
                    settings?.preferredMethod === method
                      ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_var(--accent-glow-intense)]"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10"
                  )}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- SECTION 3: TIMER ARCHITECTURE CONFIGURATION --- */}
        <motion.div variants={itemVariants} className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center">
              <Timer className="w-4 h-4 text-tertiary" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Timer Configuration</h2>
          </div>

          <div className="space-y-4">
            {/* Inspection Toggle */}
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
              <div>
                <h4 className="text-slate-900 dark:text-white text-sm font-bold">15-Second WCA Inspection</h4>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Enable the 15-second inspection countdown before each solve.</p>
              </div>
              <button
                onClick={() => updateField('timerInspection', !settings?.timerInspection)}
                className={clsx(
                  "w-12 h-7 rounded-full transition-all duration-300 relative flex-shrink-0",
                  settings?.timerInspection ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "bg-slate-200 dark:bg-white/10"
                )}
              >
                <div className={clsx(
                  "w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-md",
                  settings?.timerInspection ? "left-6" : "left-1"
                )} />
              </button>
            </div>

            {/* Smart Cube Toggle */}
            <div className="relative">
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5 opacity-80">
                <div>
                  <h4 className="text-slate-900 dark:text-white text-sm font-bold flex items-center gap-2">
                    Smart Cube Connection
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Enable Bluetooth smart cube integration for automatic move tracking.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSmartCubeMessage('Bluetooth Smart Cube support is coming soon!');
                    setTimeout(() => setSmartCubeMessage(null), 3000);
                  }}
                  // Locked in the "off" visual state
                  className="w-12 h-7 rounded-full transition-all duration-300 relative flex-shrink-0 bg-slate-200 dark:bg-white/10"
                >
                  <div className="w-5 h-5 rounded-full bg-white absolute top-1 left-1 transition-all duration-300 shadow-md" />
                </button>
              </div>

              {/* Animated Coming Soon Message */}
              <AnimatePresence>
                {smartCubeMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden px-1"
                  >
                    <p className="text-xs font-bold text-tertiary mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                      {smartCubeMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* --- SECTION 4: COSMETIC RUNTIME APPEARANCE PREVIEW --- */}
        <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 w-full">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Workspace HUD Aesthetic</h2>
          </div>

          <div className="space-y-5 sm:space-y-6 w-full">
            {/* Live Dashboard Preview Grid Panel wrapper */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 block">Fluid Theme Mock Preview</label>

              <div
                className={clsx(
                  "relative w-full h-[220px] rounded-2xl border overflow-hidden transition-all duration-500 shadow-md p-3 flex gap-2.5",
                  isStagedDark
                    ? "bg-[#111315] border-white/5 text-[#F5F7FA]"
                    : "bg-[#DCDFE2] border-white/40 text-[#0F172A]"
                )}
              >
                {/* Background AI Glow replication inside the miniature preview */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30 transition-all duration-500"
                  style={{
                    background: isStagedDark
                      ? `radial-gradient(circle at 50% 30%, ${stagedAccent === 'blue' ? 'rgba(37, 99, 235, 0.4)' :
                        stagedAccent === 'purple' ? 'rgba(124, 58, 237, 0.4)' :
                          stagedAccent === 'graphite' ? 'rgba(113, 113, 122, 0.4)' :
                            'rgba(31, 41, 55, 0.5)'
                      } 0%, transparent 70%)`
                      : `radial-gradient(circle at 50% 30%, ${stagedAccent === 'blue' ? 'rgba(37, 99, 235, 0.25)' :
                        stagedAccent === 'purple' ? 'rgba(124, 58, 237, 0.25)' :
                          stagedAccent === 'graphite' ? 'rgba(113, 113, 122, 0.25)' :
                            'rgba(31, 41, 55, 0.3)'
                      } 0%, transparent 70%)`
                  }}
                />

                {/* Left Mini Sidebar */}
                <div
                  className={clsx(
                    "w-12 h-full rounded-xl border flex flex-col items-center py-2.5 gap-2.5 transition-all duration-300 relative z-10",
                    isStagedDark
                      ? "bg-[#181A1D]/80 border-white/5"
                      : "bg-[#F0F4F8]/35 border-white/40 backdrop-blur-md"
                  )}
                >
                  {/* Cubora Mini Logo */}
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm transition-all duration-300"
                    style={{
                      background:
                        stagedAccent === 'blue' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' :
                          stagedAccent === 'purple' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' :
                            stagedAccent === 'graphite' ? 'linear-gradient(135deg, #a1a1aa, #3f3f46)' :
                              'linear-gradient(135deg, #4B5563, #111827)'
                    }}
                  >
                    C
                  </div>
                  {/* Sidebar Items */}
                  <div className="flex flex-col gap-1.5 w-full px-2 mt-2">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className={clsx(
                          "h-5 rounded-md flex items-center justify-center transition-colors",
                          idx === 1
                            ? (stagedAccent === 'blue' ? "bg-blue-600/20 text-blue-500" :
                              stagedAccent === 'purple' ? "bg-purple-600/20 text-purple-500" :
                                stagedAccent === 'graphite' ? "bg-zinc-500/20 text-zinc-400" :
                                  "bg-slate-700/20 text-slate-400")
                            : "text-slate-400"
                        )}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: idx === 1
                              ? (stagedAccent === 'blue' ? "#3B82F6" :
                                stagedAccent === 'purple' ? "#8B5CF6" :
                                  stagedAccent === 'graphite' ? "#71717a" :
                                    "#4B5563")
                              : (isStagedDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.15)")
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Area (Navbar + Grid) */}
                <div className="flex-1 h-full flex flex-col gap-2 relative z-10">
                  {/* Mini Navbar */}
                  <div
                    className={clsx(
                      "w-full h-8 rounded-lg border flex items-center justify-between px-3 transition-all duration-300",
                      isStagedDark
                        ? "bg-[#181A1D]/50 border-white/5"
                        : "bg-[#F0F4F8]/35 border-white/45 backdrop-blur-md"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-2 rounded bg-slate-400/35" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400/20" />
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-400/20" />
                      <div className="w-4 h-4 rounded-full bg-slate-400/35" />
                    </div>
                  </div>

                  {/* Mini Cards Grid */}
                  <div className="flex-1 overflow-hidden flex flex-col gap-2">
                    {/* Header line & Action */}
                    <div className="flex items-center justify-between px-1">
                      <div className="w-16 h-3 rounded bg-slate-500/40" />
                      <div
                        className="w-14 h-4 rounded-md shadow-sm transition-all duration-300"
                        style={{
                          background:
                            stagedAccent === 'blue' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' :
                              stagedAccent === 'purple' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' :
                                stagedAccent === 'graphite' ? 'linear-gradient(135deg, #a1a1aa, #3f3f46)' :
                                  'linear-gradient(135deg, #4B5563, #111827)'
                        }}
                      />
                    </div>

                    {/* Top Widgets Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Solve Streak Card */}
                      <div
                        className={clsx(
                          "p-1.5 rounded-lg border flex flex-col gap-1 transition-all duration-300",
                          isStagedDark
                            ? "bg-[#181A1D]/60 border-white/5"
                            : "bg-[#F0F4F8]/35 border-white/45 backdrop-blur-md"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-orange-500/25 flex items-center justify-center">
                            <div className="w-1 h-1 bg-orange-500 rounded-full" />
                          </div>
                          <div className="w-6 h-1 rounded bg-slate-450/40" />
                        </div>
                        <div className="w-8 h-2 rounded bg-slate-400/50 mt-0.5" />
                      </div>

                      {/* Global Average Card */}
                      <div
                        className={clsx(
                          "p-1.5 rounded-lg border flex flex-col gap-1 transition-all duration-300",
                          isStagedDark
                            ? "bg-[#181A1D]/60 border-white/5"
                            : "bg-[#F0F4F8]/35 border-white/45 backdrop-blur-md"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded flex items-center justify-center"
                            style={{
                              backgroundColor:
                                stagedAccent === 'blue' ? 'rgba(37, 99, 235, 0.2)' :
                                  stagedAccent === 'purple' ? 'rgba(124, 58, 237, 0.2)' :
                                    stagedAccent === 'graphite' ? 'rgba(113, 113, 122, 0.2)' :
                                      'rgba(75, 85, 99, 0.2)'
                            }}
                          >
                            <div
                              className="w-1 h-1 rounded-full"
                              style={{
                                backgroundColor:
                                  stagedAccent === 'blue' ? '#3B82F6' :
                                    stagedAccent === 'purple' ? '#8B5CF6' :
                                      stagedAccent === 'graphite' ? '#71717a' :
                                        '#4B5563'
                              }}
                            />
                          </div>
                          <div className="w-8 h-1 rounded bg-slate-450/40" />
                        </div>
                        <div className="w-6 h-2 rounded bg-slate-400/50 mt-0.5" />
                      </div>

                      {/* Daily Challenge Card */}
                      <div
                        className={clsx(
                          "p-1.5 rounded-lg border flex flex-col gap-1 transition-all duration-300",
                          isStagedDark
                            ? "bg-[#181A1D]/60 border-white/5"
                            : "bg-[#F0F4F8]/35 border-white/45 backdrop-blur-md"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-purple-500/20 flex items-center justify-center">
                            <div className="w-1 h-1 bg-purple-500 rounded-full" />
                          </div>
                          <div className="w-7 h-1 rounded bg-slate-450/40" />
                        </div>
                        <div className="w-9 h-2 rounded bg-slate-400/50 mt-0.5" />
                      </div>
                    </div>

                    {/* Bottom row cards: wide Performance Trend SVG graph & AI Coach */}
                    <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
                      {/* Trend Card with Real Accent SVG */}
                      <div
                        className={clsx(
                          "col-span-2 p-2 rounded-lg border flex flex-col gap-1.5 transition-all duration-300 min-h-0",
                          isStagedDark
                            ? "bg-[#181A1D]/60 border-white/5"
                            : "bg-[#F0F4F8]/35 border-white/45 backdrop-blur-md"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-16 h-1.5 rounded bg-slate-450/45" />
                          <div className="w-8 h-2 rounded bg-slate-400/20" />
                        </div>
                        {/* Interactive SVG Chart representing the stats */}
                        <div className="flex-1 w-full overflow-hidden relative min-h-0 mt-0.5">
                          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`previewGrad-${stagedAccent}`} x1="0" y1="0" x2="0" y2="1">
                                <stop
                                  offset="0%"
                                  stopColor={
                                    stagedAccent === 'blue' ? '#3B82F6' :
                                      stagedAccent === 'purple' ? '#8B5CF6' :
                                        stagedAccent === 'graphite' ? '#71717a' :
                                          '#4B5563'
                                  }
                                  stopOpacity="0.4"
                                />
                                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {/* Area fill */}
                            <path
                              d="M0,35 Q15,10 30,28 T60,8 T90,20 T100,12 L100,40 L0,40 Z"
                              fill={`url(#previewGrad-${stagedAccent})`}
                            />
                            {/* Line path */}
                            <path
                              d="M0,35 Q15,10 30,28 T60,8 T90,20 T100,12"
                              fill="none"
                              stroke={
                                stagedAccent === 'blue' ? '#3B82F6' :
                                  stagedAccent === 'purple' ? '#8B5CF6' :
                                    stagedAccent === 'graphite' ? '#71717a' :
                                      '#1F2937'
                              }
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* AI Coach Mini Card */}
                      <div
                        className={clsx(
                          "p-2 rounded-lg border flex flex-col gap-1.5 transition-all duration-300 min-h-0",
                          isStagedDark
                            ? "bg-[#181A1D]/60 border-white/5"
                            : "bg-[#F0F4F8]/35 border-white/45 backdrop-blur-md"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] text-white font-bold"
                            style={{
                              backgroundColor:
                                stagedAccent === 'blue' ? '#3B82F6' :
                                  stagedAccent === 'purple' ? '#8B5CF6' :
                                    stagedAccent === 'graphite' ? '#71717a' :
                                      '#1f2937'
                            }}
                          >
                            AI
                          </div>
                          <div className="w-10 h-1.5 rounded bg-slate-450/45" />
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="w-full h-1 rounded bg-slate-400/25" />
                          <div className="w-full h-1 rounded bg-slate-400/25" />
                          <div
                            className="w-[85%] h-1 rounded transition-colors"
                            style={{
                              backgroundColor:
                                stagedAccent === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
                                  stagedAccent === 'purple' ? 'rgba(139, 92, 246, 0.4)' :
                                    stagedAccent === 'graphite' ? 'rgba(113, 113, 122, 0.4)' :
                                      'rgba(75, 85, 99, 0.4)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Selector Tab Button Row */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 block">Theme Preset Node</label>
              <div className="flex gap-2 w-full">
                {THEMES.map(theme => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setStagedTheme(theme as any)}
                    className={clsx(
                      "flex-1 px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border min-h-[44px]",
                      stagedTheme === theme
                        ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_var(--accent-glow-intense)]"
                        : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-transparent hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10"
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Concentric-Ring Accent Color Selectors Grid */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">HUD Runtime Accent Color</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {[
                  { id: 'graphite', name: 'Graphite', bg: 'bg-zinc-500', glow: 'shadow-[0_0_15px_rgba(113,113,122,0.4)]', ringColor: 'border-zinc-500' },
                  { id: 'blue', name: 'Electric Blue', bg: 'bg-blue-600', glow: 'shadow-[0_0_15px_rgba(37,99,235,0.4)]', ringColor: 'border-blue-600' },
                  { id: 'purple', name: 'Deep Purple', bg: 'bg-purple-600', glow: 'shadow-[0_0_15px_rgba(124,58,237,0.4)]', ringColor: 'border-purple-600' },
                  { id: 'matte-black', name: 'Matte Black', bg: 'bg-slate-800 dark:bg-black', glow: 'shadow-[0_0_15px_rgba(31,41,55,0.4)]', ringColor: 'border-slate-800 dark:border-white/40' }
                ].map((acc) => {
                  const isActive = stagedAccent === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setStagedAccent(acc.id as any)}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 relative group min-h-[96px] w-full",
                        isActive
                          ? "bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/20 scale-[1.02]"
                          : "bg-transparent border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100/30 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      <div className={clsx(
                        "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative shrink-0",
                        isActive ? `${acc.ringColor} ${acc.glow}` : "border-slate-200 dark:border-white/10 sm:group-hover:scale-105"
                      )}>
                        <div className={clsx("w-6 h-6 rounded-full transition-transform duration-300", acc.bg, isActive ? "scale-90" : "sm:group-hover:scale-95")} />
                        {isActive && (
                          <div className="absolute inset-0.5 rounded-full border border-dashed border-white/50 animate-[spin_8s_linear_infinite] pointer-events-none" />
                        )}
                      </div>
                      <span className={clsx("text-[11px] font-bold transition-colors truncate w-full text-center mt-1", isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-gray-500 sm:group-hover:text-slate-600 sm:dark:group-hover:text-gray-300")}>
                        {acc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- SECTION 5: ACCOUNT DELETION ZONE --- */}
        <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 w-full">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Danger Configuration Matrix</h2>
          </div>

          <div className="space-y-2 w-full">
            <button
              onClick={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError(null);
                setPasswordSuccess(null);
                setIsPasswordModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-xl border border-slate-100 dark:border-white/5 sm:hover:bg-slate-100/50 sm:dark:hover:bg-white/5 transition-colors group min-h-[52px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Key className="w-5 h-5 text-primary shrink-0" />
                <span className="text-slate-900 dark:text-white text-xs sm:text-sm font-bold truncate">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-500 sm:group-hover:text-slate-900 sm:dark:group-hover:text-white transition-colors shrink-0" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-xl border border-slate-100 dark:border-white/5 sm:hover:bg-slate-100/50 sm:dark:hover:bg-white/5 transition-colors group min-h-[52px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <LogOut className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-slate-900 dark:text-white text-xs sm:text-sm font-bold truncate">Terminate Session</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-500 sm:group-hover:text-slate-900 sm:dark:group-hover:text-white transition-colors shrink-0" />
            </button>

            <button
              onClick={() => {
                setDeleteConfirmText('');
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10 sm:hover:bg-red-500/10 sm:hover:border-red-500/20 transition-colors group min-h-[52px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-red-500 text-xs sm:text-sm font-bold truncate">Purge Account Permanently</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-500/50 sm:group-hover:text-red-500 transition-colors shrink-0" />
            </button>
          </div>
        </motion.div>

      </motion.div>

      {/* Account Deletion Modal (Portal Attachment Shield) */}
      {createPortal(
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          className="max-w-md p-5 xs:p-6 sm:p-8 flex flex-col gap-5 sm:gap-6"
        >
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-655 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
            aria-label="Close modal content"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-red-500 text-left">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/15 shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Delete Account</h3>
              <p className="text-[11px] text-red-500 dark:text-red-400 font-mono tracking-wide">PERMANENT DESTRUCTION ACTION</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 space-y-2 text-left leading-relaxed">
            <p>Deleting your profile clears all historical solvers splits, AI coach roadmaps, verified session logs, community threads, and personalization settings.</p>
            <p className="text-xs font-bold text-slate-450 dark:text-gray-500 bg-black/5 dark:bg-white/[0.02] p-2 rounded-lg border border-slate-200 dark:border-white/5">
              Type <span className="text-red-500 font-mono font-bold select-all">DELETE</span> below to execute account termination. (Case-Sensitive)
            </p>
          </div>

          <div>
            {/* Text-base size configuration layout blocks forced safari zoom shunts */}
            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-base md:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors placeholder-slate-400 dark:placeholder-gray-600 font-mono tracking-wider min-h-[44px]"
            />
          </div>

          {deleteError && (
            <div className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/10 text-left">
              {deleteError}
            </div>
          )}

          <div className="flex gap-3 mt-1 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 rounded-xl h-11 min-h-[44px] text-xs font-bold"
            >
              Cancel
            </Button>
            <button
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:hover:bg-red-500 text-white rounded-xl h-11 min-h-[44px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              {isDeleting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Purging...</>
              ) : (
                'Delete Forever'
              )}
            </button>
          </div>
        </Modal>,
        document.body
      )}

      {/* Change Password Modal */}
      {createPortal(
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          className="max-w-md p-5 xs:p-6 sm:p-8 flex flex-col gap-5 sm:gap-6"
        >
          <button
            onClick={() => setIsPasswordModalOpen(false)}
            className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
            aria-label="Close modal content"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/15 shrink-0">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Change Password</h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono tracking-wide">SECURE YOUR ACCOUNT</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Old Password</label>
              <Input
                type="password"
                placeholder="Enter old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[16px] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[16px] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[16px] sm:text-sm"
                required
              />
            </div>

            {passwordError && (
              <div className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/10">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/10">
                {passwordSuccess}
              </div>
            )}

            <div className="flex gap-3 mt-5 w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 rounded-xl h-11 min-h-[44px] text-xs font-bold"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white rounded-xl h-11 min-h-[44px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                {isUpdatingPassword ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </Modal>,
        document.body
      )}

    </PageTransition>
  );
}