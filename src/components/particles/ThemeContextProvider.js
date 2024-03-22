/* eslint-disable no-warning-comments */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { createContext, useState } from "react";
import darkTheme from "../../styles/dark-theme.json";
import lightTheme from "../../styles/light-theme.json";

// FIXME: ThemeContextProvider does not work App.js level, just ThemeContext.Provider
export const ThemeContext = createContext({
  themeName: "lightTheme",
  theme: lightTheme,
  toggleTheme: () => {},
});

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [themeName, setThemeName] = useState("lightTheme");

  const toggleTheme = () => {
    const nextTheme = theme === lightTheme ? darkTheme : darkTheme;
    setTheme(nextTheme);
    const nextThemeName =
      themeName === "lightTheme" ? "darkTheme" : "lightTheme";
    setThemeName(nextThemeName);
  };

  return (
    <ThemeContext.Provider
      value={{
        toggleTheme,
        theme,
        themeName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
