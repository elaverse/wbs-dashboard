import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Theme = 'default' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  bgPage: string;
  bgCard: string;
  textColor: string;
  borderColor: string;
}

const defaultStyles = {
  default: {
    bgPage: '#1a1a1a',
    bgCard: '#2d2d2d',
    textColor: '#ffffff',
    borderColor: '#444',
  },
  light: {
    bgPage: '#ffffff',
    bgCard: '#fafafa',
    textColor: '#333',
    borderColor: '#eee',
  },
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'default' ? 'light' : 'default'));
  }, []);

  const styles = defaultStyles[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        bgPage: styles.bgPage,
        bgCard: styles.bgCard,
        textColor: styles.textColor,
        borderColor: styles.borderColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
