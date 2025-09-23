import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  PropsWithChildren,
  useEffect,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🧩 Theme Types
export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  backgroundLight: string;
  backgroundDark: string;
  surface: string;
  textPrimary: string;
  brandPrimary: string;
  onBrandPrimary: string;
}

export interface ThemeContextType {
  theme: ThemeType; // ✅ renamed from mode
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

// 🎨 Color Palettes
const lightColors: ThemeColors = {
  backgroundLight: '#FDFDFD',
  backgroundDark: '#1C1C1E',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  brandPrimary: '#007AFF',
  onBrandPrimary: '#FFFFFF',
};

const darkColors: ThemeColors = {
  backgroundLight: '#FDFDFD',
  backgroundDark: '#1C1C1E',
  surface: '#2C2C2E',
  textPrimary: '#FDFDFD',
  brandPrimary: '#0A84FF',
  onBrandPrimary: '#FFFFFF',
};

const THEME_KEY = 'user-theme-preference';

// 🧠 Context Initialization
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  setTheme: () => {},
  toggleTheme: () => {},
});

// 🧪 Storage Helpers
const getStoredTheme = async (): Promise<ThemeType | null> => {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
    return null;
  }
};

const saveThemePreference = async (theme: ThemeType) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to storage:', error);
  }
};

// 🧾 Provider Component
export const ThemeProvider = ({ children }: PropsWithChildren<{}>) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [theme, setThemeState] = useState<ThemeType>('light');



  useEffect(() => {
    (async () => {
      const stored = await getStoredTheme();
      setThemeState(stored ?? systemScheme ?? 'light');
    })();
  }, [systemScheme]);

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      colors: theme === 'light' ? lightColors : darkColors,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

// 🪄 Custom Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
