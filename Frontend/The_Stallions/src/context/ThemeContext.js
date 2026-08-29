import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../constants/ui';
import { storage } from '../services/storage';

const THEME_KEY = 'appThemeMode';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storage.get(THEME_KEY);
        const initial = stored === 'light' || stored === 'dark' ? stored : 'dark';
        setModeState(initial);
      } catch {
        setModeState('dark');
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setMode = async (m) => {
    setModeState(m);
    try {
      await storage.set(THEME_KEY, m);
    } catch {}
  };

  const toggleMode = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    await setMode(next);
  };

  const colors = mode === 'dark' ? darkColors : lightColors;
  void systemScheme;

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode, colors, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
