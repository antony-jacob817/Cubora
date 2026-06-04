// Centralized Reusable Design System Tokens for Cubora AI

export const DESIGN_TOKENS = {
  theme: {
    dark: {
      background: '#111315',
      surface: '#181A1D',
      glass: 'rgba(255,255,255,0.045)',
      border: 'rgba(255,255,255,0.06)',
      textPrimary: '#F5F7FA',
      textSecondary: '#9CA3AF'
    },
    light: {
      background: '#ECEFF1',
      surface: 'rgba(255,255,255,0.72)',
      border: 'rgba(0,0,0,0.06)',
      textPrimary: '#0F172A',
      textSecondary: '#475569'
    }
  },
  physics: {
    // Flagship spatial computing springs (stiffness: 120, damping: 18, mass: 0.6)
    cinematic: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
      mass: 0.6,
    },
    ui: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      mass: 0.4,
    },
    tactile: {
      type: 'spring',
      stiffness: 180,
      damping: 20,
      mass: 0.35,
    }
  },
  glass: {
    ultraFrost: {
      backdropFilter: 'blur(28px) saturate(180%)',
      boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
    },
    card: {
      backdropFilter: 'blur(18px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
    }
  }
};
