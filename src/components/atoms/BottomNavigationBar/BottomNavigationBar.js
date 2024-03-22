/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */

import { BottomNavigation, BottomNavigationTab } from "@ui-kitten/components";
import React from "react";

const BottomTabBar = () => {
  return (
    <BottomNavigation
      selectedIndex={selectedIndex}
      onSelect={(index) => setSelectedIndex(index)}
    >
      <BottomNavigationTab title="All" />
      <BottomNavigationTab title="Food" />
      <BottomNavigationTab title="Drinks" />
      <BottomNavigationTab title="Merch" />
    </BottomNavigation>
  );
};

export default BottomTabBar;
