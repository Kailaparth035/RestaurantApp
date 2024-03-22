/* eslint-disable react/prop-types */
/* eslint-disable arrow-body-style */

import React, { createContext } from "react";

export const UiKittenContext = createContext();

const UiKittenProvider = ({ children }) => {
  return <UiKittenContext.Provider>{children}</UiKittenContext.Provider>;
};
export default UiKittenProvider;
