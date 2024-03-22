import PropTypes from "prop-types";
import React, { createContext, useState } from "react";

export const NavigationAdminContext = createContext();

const NavigationAdminProvider = ({ children, ...props }) => {
  const [navigation, setNavigation] = useState("OrderHistory");

  return (
    <NavigationAdminContext.Provider
      value={{
        navigation,
        setNavigation,
      }}
    >
      {children}
    </NavigationAdminContext.Provider>
  );
};

NavigationAdminProvider.propTypes = {
  navigation: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default NavigationAdminProvider;
