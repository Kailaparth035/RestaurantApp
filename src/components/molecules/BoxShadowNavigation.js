import PropTypes from "prop-types";
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { NormalisedSizes } from "../../hooks/Normalized";
import { Box } from "../layouts/Index";
import { ThemeContext } from "../particles/ThemeContextProvider";

const styles = (opacityWithTheme) =>
  StyleSheet.create({
    boxShadowNavigation: {
      shadowColor: "#000",
      shadowOpacity: opacityWithTheme,
      shadowOffset: { width: 0, height: NormalisedSizes(1) },
      shadowRadius: NormalisedSizes(3),
      elevation: NormalisedSizes(4),
    },
  });

const BoxShadowNavigation = ({ children, ...props }) => {
  const { themeName } = useContext(ThemeContext);
  const opacityTheme = themeName === "lightTheme" ? 0.1 : 0.5;

  return (
    <Box {...props} style={styles(opacityTheme)?.boxShadowNavigation}>
      {children}
    </Box>
  );
};

BoxShadowNavigation.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
};

export default BoxShadowNavigation;
