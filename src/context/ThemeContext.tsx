import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type Theme = 'light' | 'dark' | 'system';
export type Accent = 'graphite' | 'blue' | 'purple' | 'matte-black';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  accent: Accent;
  setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, getAuthHeaders } = useAuth();
  
  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('cubora_theme') as Theme) || 'dark';
  });

  // Accent state - defaulting to 'graphite' and persisting in localStorage.themeAccent
  const [accent, setAccentState] = useState<Accent>(() => {
    return (localStorage.getItem('themeAccent') as Accent) || 'graphite';
  });

  const [systemDark, setSystemDark] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Sync theme with backend settings if user is logged in
  const hasUserToggledRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (token) {
      let isMounted = true;
      const fetchBackendTheme = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/settings', {
            headers: getAuthHeaders(),
          });
          const data = await res.json();
          if (isMounted && !hasUserToggledRef.current && data.success && data.data) {
            if (data.data.theme) {
              const backendTheme = data.data.theme as Theme;
              setThemeState(backendTheme);
              localStorage.setItem('cubora_theme', backendTheme);
            }
            if (data.data.accent) {
              const backendAccent = data.data.accent as Accent;
              setAccentState(backendAccent);
              localStorage.setItem('themeAccent', backendAccent);
            }
          }
        } catch (err) {
          console.error('Failed to fetch theme settings from backend:', err);
        }
      };
      fetchBackendTheme();
      return () => {
        isMounted = false;
      };
    }
  }, [token]);

  const setTheme = async (newTheme: Theme) => {
    hasUserToggledRef.current = true;
    setThemeState(newTheme);
    localStorage.setItem('cubora_theme', newTheme);

    // If logged in, sync with backend settings asynchronously
    if (token) {
      try {
        await fetch('http://localhost:5000/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch (err) {
        console.error('Failed to sync theme with backend:', err);
      }
    }
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem('themeAccent', newAccent);
  };

  // Derive isDarkMode instantly during render
  const isDarkMode = theme === 'system' ? systemDark : theme === 'dark';

  // Apply root dark/light classes on changes
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // Apply accent class to document element and update browser favicon dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    const accentClasses = ['accent-graphite', 'accent-blue', 'accent-purple', 'accent-matte-black'];
    accentClasses.forEach(cls => {
      root.classList.remove(cls);
      body.classList.remove(cls);
    });

    const activeAccentClass = `accent-${accent}`;
    root.classList.add(activeAccentClass);
    body.classList.add(activeAccentClass);

    // Dynamic favicon updates based on accent selection
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      let faviconUrl = '/favicon.png';
      switch (accent) {
        case 'graphite':
          faviconUrl = '/favicon-grey.png';
          break;
        case 'blue':
          faviconUrl = '/favicon-blue.png';
          break;
        case 'purple':
          faviconUrl = '/favicon-purple.png';
          break;
        case 'matte-black':
          faviconUrl = '/favicon-black.png';
          break;
        default:
          faviconUrl = '/favicon.png';
      }
      link.href = faviconUrl;
    }
  }, [accent]);

  // Listen for system theme changes if set to system
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        setSystemDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider wrapper.');
  }
  return context;
};
