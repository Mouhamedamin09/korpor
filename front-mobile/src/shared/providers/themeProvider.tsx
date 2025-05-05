import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme(); // 'light' or 'dark'
  const [theme, setTheme] = useState<Theme>("system");

  // Calculate real theme
  const isDark =
    theme === "dark" || (theme === "system" && systemColorScheme === "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeWrapper isDark={isDark}>{children}</ThemeWrapper>
    </ThemeContext.Provider>
  );
};

// This component applies the "dark" class dynamically
import { View } from "react-native";

const ThemeWrapper = ({
  isDark,
  children,
}: {
  isDark: boolean;
  children: React.ReactNode;
}) => {
  return <View className={isDark ? "dark flex-1" : "flex-1"}>{children}</View>;
};
