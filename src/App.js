import { ApolloProvider } from "@apollo/client";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import DatabaseProvider from "@nozbe/watermelondb/DatabaseProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect, useState } from "react";

import { database } from "../data/database";
import ApolloClient from "./components/ApolloClient";
import { ThemeContext } from "./components/particles/ThemeContextProvider";
import { AuthContextProvider } from "./contexts/AuthContext";

import { Main } from "./Main";
import { default as customMapping } from "./styles/custommapping.json";
import { default as darkTheme } from "./styles/dark-theme.json";
import { default as lightTheme } from "./styles/light-theme.json";


export default function App() {  
  console.log("app component");
  const [theme, setTheme] = useState(lightTheme);
  const [themeName, setThemeName] = useState("lightTheme");

  const toggleTheme = () => {
    const nextTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(nextTheme);
    const nextThemeName =
      themeName === "lightTheme" ? "darkTheme" : "lightTheme";
    setThemeName(nextThemeName);
  };

  console.log("app component", new Date().toISOString());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider database={database}>
        <ApolloProvider client={ApolloClient}>
          <AuthContextProvider>
            <ThemeContext.Provider value={{ theme, toggleTheme, themeName }}>
              <IconRegistry icons={EvaIconsPack} />
              <ApplicationProvider
                {...eva}
                theme={theme}
                customMapping={customMapping}
                themeName={themeName}
              >
                <Main />
              </ApplicationProvider>
            </ThemeContext.Provider>
          </AuthContextProvider>
        </ApolloProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
